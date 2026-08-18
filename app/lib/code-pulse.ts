export type CodePulseSource = "github" | "bitbucket";

export type ContributionDay = {
  date: string;
  total: number;
  sources: Partial<Record<CodePulseSource, number>>;
};

export type CodePulsePayload = {
  range: { from: string; to: string };
  total: number;
  sources: Partial<Record<CodePulseSource, number>>;
  days: ContributionDay[];
};

type Range = CodePulsePayload["range"];
type Contribution = { date: string; source: CodePulseSource; id: string };

const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });

function localDate(value: Date | string) {
  const parts = dateFormatter.formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function addDays(date: string, amount: number) {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + amount);
  return result.toISOString().slice(0, 10);
}

export function contributionRange(now = new Date()): Range {
  const to = localDate(now);
  return { from: addDays(to, -364), to };
}

export function aggregate(range: Range, values: Contribution[]): CodePulsePayload {
  const unique = new Map<string, Contribution>();
  values.forEach((value) => unique.set(`${value.source}:${value.id}`, value));
  const days = new Map<string, ContributionDay>();
  for (let date = range.from; date <= range.to; date = addDays(date, 1)) days.set(date, { date, total: 0, sources: {} });
  for (const value of unique.values()) {
    const day = days.get(value.date);
    if (!day) continue;
    day.total += 1;
    day.sources[value.source] = (day.sources[value.source] ?? 0) + 1;
  }
  const result: CodePulsePayload = { range, total: 0, sources: {}, days: [...days.values()] };
  result.days.forEach((day) => {
    result.total += day.total;
    (Object.entries(day.sources) as [CodePulseSource, number][]).forEach(([source, count]) => result.sources[source] = (result.sources[source] ?? 0) + count);
  });
  return result;
}

export async function githubContributions(username: string, token: string | undefined, range: Range): Promise<Contribution[]> {
  const query = `query ($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) { contributionsCollection(from: $from, to: $to) { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`;
  const response = await fetch("https://api.github.com/graphql", { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ query, variables: { login: username, from: `${range.from}T00:00:00-03:00`, to: `${range.to}T23:59:59-03:00` } }) });
  const body = await response.json() as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { weeks?: { contributionDays?: { date: string; contributionCount: number }[] }[] } } } }; errors?: unknown[] };
  if (!response.ok || body.errors?.length || !body.data?.user) throw new Error("GitHub unavailable");
  return body.data.user.contributionsCollection?.contributionCalendar?.weeks?.flatMap((week) => (week.contributionDays ?? []).flatMap((day) => Array.from({ length: day.contributionCount }, (_, index) => ({ date: day.date, source: "github" as const, id: `${day.date}:${index}` })))) ?? [];
}

type Page<T> = { values: T[]; next?: string };
type Workspace = { workspace: { slug: string } };
type Repository = { slug: string };
type Commit = { hash: string; date: string; author?: { raw?: string; user?: { nickname?: string; username?: string } } };

async function allBitbucket<T>(url: string, email: string, token: string): Promise<T[]> {
  const values: T[] = [];
  const authorization = `Basic ${btoa(`${email}:${token}`)}`;
  for (let next: string | undefined = url; next;) {
    const response = await fetch(next, { headers: { authorization, accept: "application/json" } });
    if (!response.ok) throw new Error("Bitbucket unavailable");
    const page = await response.json() as Page<T>;
    values.push(...page.values);
    next = page.next;
  }
  return values;
}

export async function bitbucketContributions(username: string, email: string, token: string, emails: string[], range: Range): Promise<Contribution[]> {
  const aliases = new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean));
  const values: Contribution[] = [];
  const workspaces = await allBitbucket<Workspace>("https://api.bitbucket.org/2.0/user/workspaces", email, token);
  for (const workspace of workspaces) {
    const root = `https://api.bitbucket.org/2.0/repositories/${encodeURIComponent(workspace.workspace.slug)}`;
    for (const repository of await allBitbucket<Repository>(root, email, token)) {
      for (const commit of await allBitbucket<Commit>(`${root}/${encodeURIComponent(repository.slug)}/commits`, email, token)) {
        const date = localDate(commit.date);
        if (date < range.from) break;
        const raw = commit.author?.raw?.toLowerCase() ?? "";
        const email = raw.match(/<([^>]+)>/)?.[1];
        const identity = commit.author?.user?.nickname ?? commit.author?.user?.username;
        if (date <= range.to && ((email && aliases.has(email)) || identity?.toLowerCase() === username.toLowerCase())) values.push({ date, source: "bitbucket", id: commit.hash });
      }
    }
  }
  return values;
}

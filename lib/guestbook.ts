export const GUESTBOOK_NAME_MAX = 50;
export const GUESTBOOK_MESSAGE_MAX = 360;
export const GUESTBOOK_URL_MAX = 2048;
export const GUESTBOOK_PAGE_SIZE = 12;
export const GUESTBOOK_RATE_LIMIT = 3;

export type GuestbookStatus = "pending" | "approved" | "rejected";

export type GuestbookSubmission = {
  name: string;
  message: string;
  url: string | null;
  turnstileToken: string;
  company: string;
};

export type GuestbookEntry = {
  publicId: string;
  name: string;
  message: string;
  url: string | null;
  status?: GuestbookStatus;
  createdAt: string;
};

type ValidationResult =
  | { ok: true; value: GuestbookSubmission }
  | { ok: false; error: string; fields: Record<string, string> };

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const ANGLE_BRACKETS = /[<>]/u;
const LONE_SURROGATE = /[\uD800-\uDFFF]/u;

function codePointLength(value: string) {
  return Array.from(value).length;
}

function normalizeText(value: unknown, multiline: boolean) {
  if (typeof value !== "string") return "";
  const normalized = value.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  return multiline ? normalized : normalized.replace(/\s+/g, " ");
}

function plainTextError(value: string) {
  if (CONTROL_CHARACTERS.test(value) || LONE_SURROGATE.test(value)) {
    return "Remove invalid characters.";
  }
  if (ANGLE_BRACKETS.test(value)) {
    return "Use plain text only.";
  }
  return null;
}

export function normalizeGuestbookUrl(value: unknown): string | null {
  const raw = normalizeText(value, false);
  if (!raw) return null;
  if (codePointLength(raw) > GUESTBOOK_URL_MAX || CONTROL_CHARACTERS.test(raw)) {
    throw new Error("Invalid URL.");
  }

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error("Only public HTTP or HTTPS links are allowed.");
  }

  const hostname = parsed.hostname.toLowerCase();
  const privateIpv4 = /^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/u;
  if (!hostname || hostname === "localhost" || hostname === "::1" || privateIpv4.test(hostname)) {
    throw new Error("Enter a public website URL.");
  }

  parsed.hash = "";
  return parsed.toString();
}

export function validateGuestbookSubmission(input: unknown): ValidationResult {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const name = normalizeText(source.name, false);
  const message = normalizeText(source.message, true);
  const turnstileToken = normalizeText(source.turnstileToken, false);
  const company = normalizeText(source.company, false);
  const fields: Record<string, string> = {};

  if (!name) fields.name = "Name is required.";
  else if (codePointLength(name) > GUESTBOOK_NAME_MAX) fields.name = `Use ${GUESTBOOK_NAME_MAX} characters or fewer.`;
  else {
    const error = plainTextError(name);
    if (error) fields.name = error;
  }

  if (!message) fields.message = "Message is required.";
  else if (codePointLength(message) > GUESTBOOK_MESSAGE_MAX) fields.message = `Use ${GUESTBOOK_MESSAGE_MAX} characters or fewer.`;
  else {
    const error = plainTextError(message);
    if (error) fields.message = error;
  }

  let url: string | null = null;
  try {
    url = normalizeGuestbookUrl(source.url);
  } catch (error) {
    fields.url = error instanceof Error ? error.message : "Enter a valid URL.";
  }

  if (Object.keys(fields).length) {
    return { ok: false, error: "Check the highlighted fields.", fields };
  }

  return { ok: true, value: { name, message, url, turnstileToken, company } };
}

export function isGuestbookRateLimited(recentSubmissions: number) {
  return recentSubmissions >= GUESTBOOK_RATE_LIMIT;
}

export function filterApprovedEntries<T extends { status: GuestbookStatus }>(entries: T[]) {
  return entries.filter((entry) => entry.status === "approved");
}

export async function verifyTurnstileToken(
  token: string,
  secret: string,
  remoteIp?: string,
  fetcher: typeof fetch = fetch,
) {
  if (!token || !secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

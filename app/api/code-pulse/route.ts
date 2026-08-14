import { NextResponse } from "next/server";
import { aggregate, bitbucketContributions, contributionRange, githubContributions } from "@/app/lib/code-pulse";

type RuntimeEnv = { GITHUB_USERNAME?: string; GITHUB_TOKEN?: string; BITBUCKET_USERNAME?: string; BITBUCKET_EMAIL?: string; BITBUCKET_ACCESS_TOKEN?: string; CONTRIBUTION_EMAILS?: string };

export const revalidate = 3600;

async function getEnv(): Promise<RuntimeEnv> {
  const runtime = await import("cloudflare:workers");
  return runtime.env as RuntimeEnv;
}

export async function GET() {
  const env = await getEnv();
  const range = contributionRange();
  const requests: Promise<Awaited<ReturnType<typeof githubContributions>>>[] = [];
  if (env.GITHUB_USERNAME) requests.push(githubContributions(env.GITHUB_USERNAME, env.GITHUB_TOKEN, range));
  if (env.BITBUCKET_USERNAME && env.BITBUCKET_EMAIL && env.BITBUCKET_ACCESS_TOKEN) requests.push(bitbucketContributions(env.BITBUCKET_USERNAME, env.BITBUCKET_EMAIL, env.BITBUCKET_ACCESS_TOKEN, (env.CONTRIBUTION_EMAILS ?? "").split(","), range));
  if (!requests.length) return NextResponse.json({ available: false }, { status: 503 });
  const results = await Promise.allSettled(requests);
  const contributions = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!contributions.length && results.every((result) => result.status === "rejected")) return NextResponse.json({ available: false }, { status: 503 });
  return NextResponse.json(aggregate(range, contributions), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}

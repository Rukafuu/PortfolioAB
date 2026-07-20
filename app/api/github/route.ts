import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const response = await fetch("https://api.github.com/users/Rukafuu/repos?sort=updated&per_page=100", {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "lucas-personal-os" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return NextResponse.json([], { status: 200 });
    const repos = await response.json();
    return NextResponse.json(repos.map((repo: Record<string, unknown>) => ({
      name: repo.name,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      updated_at: repo.updated_at,
    })), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json([]);
  }
}

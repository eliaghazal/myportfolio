import { NextResponse } from "next/server";

const CACHE: { data: unknown; ts: number } = { data: null, ts: 0 };
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (CACHE.data && now - CACHE.ts < CACHE_TTL_MS) {
      return NextResponse.json(CACHE.data);
    }

    const headers: HeadersInit = { "User-Agent": "elia-portfolio" };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [userRes, reposRes] = await Promise.all([
      fetch("https://api.github.com/users/eliaghazal", { headers }),
      fetch("https://api.github.com/users/eliaghazal/repos?per_page=100", { headers }),
    ]);

    const user = await userRes.json();
    const repos: Array<{ stargazers_count: number; language: string | null; fork: boolean; size: number }> = await reposRes.json();

    // Language frequency from non-fork repos
    const langMap: Record<string, number> = {};
    if (Array.isArray(repos)) {
      repos.filter(r => !r.fork && r.language).forEach(r => {
        langMap[r.language!] = (langMap[r.language!] || 0) + 1;
      });
    }
    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    // Approximate lines of code: total repo size (KB) × 30 lines/KB
    const totalSizeKB = Array.isArray(repos)
      ? repos.filter(r => !r.fork).reduce((sum, r) => sum + (r.size || 0), 0)
      : 0;
    const totalLinesApprox = Math.round(totalSizeKB * 30);

    const memberSince = user.created_at
      ? new Date(user.created_at).getFullYear()
      : null;

    const data = {
      publicRepos: user.public_repos ?? 0,
      totalLinesApprox,
      memberSince,
      topLanguages,
    };

    CACHE.data = data;
    CACHE.ts = now;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

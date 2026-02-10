async function getLeaderboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/leaderboard`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard();
  const rows = data?.rows || [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-sm text-zinc-700">
          Shows latest score per project (MVP). The Arena Tick populates evaluations and scores.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-600">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Δ</th>
                <th className="px-4 py-3">Commit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, idx: number) => (
                <tr key={r.projectId} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{r.name || "(name pending)"}</div>
                    <a className="text-xs text-zinc-600 underline" href={r.repoUrl} target="_blank" rel="noreferrer">
                      {r.repoUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{r.category}</td>
                  <td className="px-4 py-3 font-bold">{r.totalScore}</td>
                  <td className="px-4 py-3">{r.delta}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.commitSha ? String(r.commitSha).slice(0, 7) : "-"}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-zinc-600" colSpan={6}>
                    No projects yet. Submit one at /submit.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

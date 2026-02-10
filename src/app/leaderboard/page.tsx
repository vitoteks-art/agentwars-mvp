import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
  // Latest score per project (MVP)
  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      team: true,
      category: true,
      repoUrl: true,
      demoUrl: true,
      scores: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { totalScore: true, deltaVsPrev: true, createdAt: true },
      },
      evaluations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { commitSha: true },
      },
    },
  });

  const rows = projects
    .map((p) => {
      const score = p.scores[0];
      const evaln = p.evaluations[0];
      return {
        projectId: p.id,
        name: p.name,
        team: p.team,
        category: p.category,
        repoUrl: p.repoUrl,
        demoUrl: p.demoUrl,
        totalScore: score?.totalScore ?? 0,
        delta: score?.deltaVsPrev ?? 0,
        commitSha: evaln?.commitSha ?? null,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-sm text-zinc-700">
          Shows latest score per project (MVP). Run <code>npm run tick</code> to
          generate evaluations + scores.
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
              {rows.map((r, idx) => (
                <tr key={r.projectId} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-semibold">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{r.name || "(name pending)"}</div>
                    <a
                      className="text-xs text-zinc-600 underline"
                      href={r.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.repoUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{r.category}</td>
                  <td className="px-4 py-3 font-bold">{r.totalScore}</td>
                  <td className="px-4 py-3">{r.delta}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.commitSha ? String(r.commitSha).slice(0, 7) : "-"}
                  </td>
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

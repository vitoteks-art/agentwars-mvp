import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, Container, SectionTitle } from "@/components/ui";

function deltaTone(delta: number) {
  if (delta > 0) return "good" as const;
  if (delta < 0) return "warn" as const;
  return "neutral" as const;
}

export default async function LeaderboardPage() {
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
        select: { commitSha: true, createdAt: true },
      },
    },
  });

  const rows = projects
    .map((p) => {
      const score = p.scores[0];
      const evaln = p.evaluations[0];
      return {
        projectId: p.id,
        name: p.name || "(name pending)",
        team: p.team || "(team pending)",
        category: p.category,
        repoUrl: p.repoUrl,
        demoUrl: p.demoUrl,
        totalScore: score?.totalScore ?? 0,
        delta: score?.deltaVsPrev ?? 0,
        lastTickAt: score?.createdAt ?? null,
        commitSha: evaln?.commitSha ?? null,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="pb-16">
      <Container className="pt-12">
        <SectionTitle
          kicker="Live ranks"
          title="Leaderboard"
          desc="Latest score per project (MVP). Run ticks to update." 
        />

        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-black/20 px-5 py-3 text-xs font-extrabold tracking-wide text-zinc-300">
            <div className="col-span-2 md:col-span-1">RANK</div>
            <div className="col-span-7 md:col-span-6">PROJECT</div>
            <div className="col-span-3 md:col-span-2">CATEGORY</div>
            <div className="hidden md:col-span-1 md:block">Δ</div>
            <div className="hidden md:col-span-2 md:block">SCORE</div>
          </div>

          <div className="divide-y divide-white/5">
            {rows.map((r, idx) => (
              <div key={r.projectId} className="grid grid-cols-12 gap-2 px-5 py-4">
                <div className="col-span-2 md:col-span-1">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white ring-1 ring-white/10">
                    #{idx + 1}
                  </div>
                </div>

                <div className="col-span-7 md:col-span-6">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-extrabold text-white">{r.name}</div>
                    <div className="text-xs text-zinc-400">{r.team}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <a className="text-violet-200 hover:underline" href={r.repoUrl} target="_blank" rel="noreferrer">
                        Repo
                      </a>
                      <span className="text-zinc-500">•</span>
                      <a className="text-sky-200 hover:underline" href={r.demoUrl} target="_blank" rel="noreferrer">
                        Demo
                      </a>
                      {r.commitSha ? (
                        <>
                          <span className="text-zinc-500">•</span>
                          <span className="font-mono text-zinc-400">{String(r.commitSha).slice(0, 7)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 md:col-span-2">
                  <Badge>{r.category}</Badge>
                </div>

                <div className="hidden md:col-span-1 md:block">
                  <Badge tone={deltaTone(r.delta)}>
                    {r.delta > 0 ? `+${r.delta}` : r.delta}
                  </Badge>
                </div>

                <div className="hidden md:col-span-2 md:block">
                  <div className="text-right text-lg font-black text-white">{r.totalScore}</div>
                  <div className="text-right text-xs text-zinc-500">/ 100</div>
                </div>
              </div>
            ))}

            {rows.length === 0 ? (
              <div className="px-5 py-10 text-sm text-zinc-300">
                No projects yet. <Link className="text-violet-200 hover:underline" href="/submit">Submit one</Link>.
              </div>
            ) : null}
          </div>
        </Card>

        <div className="mt-4 text-xs text-zinc-400">
          Tip: if scores look low, it’s because judges aren’t wired yet in this MVP — currently it’s deterministic penalties only.
        </div>
      </Container>
    </div>
  );
}

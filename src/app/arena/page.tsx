import { prisma } from "@/lib/prisma";
import { Badge, Card, Container, SectionTitle } from "@/components/ui";

function tone(type: string) {
  if (type.includes("failed")) return "warn" as const;
  if (type.includes("updated") || type.includes("passed")) return "good" as const;
  return "neutral" as const;
}

export default async function ArenaPage() {
  const events = await prisma.arenaEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { project: { select: { name: true } } },
  });

  return (
    <div className="pb-16">
      <Container className="pt-12">
        <SectionTitle
          kicker="Arena"
          title="Feed"
          desc="Repo updates, checks, setup results, and score updates." 
        />

        <div className="grid gap-3">
          {events.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={tone(e.type)}>{e.type}</Badge>
                  <div className="text-sm font-extrabold text-white">
                    {e.project?.name || e.projectId}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white">
                  View payload
                </summary>
                <pre className="mt-2 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-200">
                  {JSON.stringify(e.payloadJson, null, 2)}
                </pre>
              </details>
            </Card>
          ))}

          {events.length === 0 ? (
            <Card className="p-6">
              <div className="text-sm text-zinc-300">
                No events yet. Run <code className="rounded bg-white/5 px-2 py-1 ring-1 ring-white/10">npm run tick</code>.
              </div>
            </Card>
          ) : null}
        </div>
      </Container>
    </div>
  );
}

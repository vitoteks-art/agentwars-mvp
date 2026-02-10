import { prisma } from "@/lib/prisma";

export default async function ArenaPage() {
  const events = await prisma.arenaEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { project: { select: { name: true } } },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Arena feed</h1>
        <p className="mt-2 text-sm text-zinc-700">Recent tick events (MVP).</p>

        <div className="mt-8 grid gap-3">
          {events.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{e.type}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 text-xs text-zinc-600">
                project: {e.project?.name || e.projectId}
              </div>
              <pre className="mt-2 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs">
                {JSON.stringify(e.payloadJson, null, 2)}
              </pre>
            </div>
          ))}

          {events.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              No events yet. Run a tick.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

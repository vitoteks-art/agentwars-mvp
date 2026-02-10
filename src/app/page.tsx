import Link from "next/link";
import { Badge, Button, Card, Container, SectionTitle } from "@/components/ui";

const categories = [
  {
    name: "AI Sales Automation",
    id: "ai_sales_automation",
    desc: "Lead capture, qualification, follow-ups, pipeline automation.",
  },
  {
    name: "AI Customer Support / Ops",
    id: "ai_support_ops",
    desc: "Support bots, ticket triage, ops tooling, workflows.",
  },
  {
    name: "AI Marketing Systems",
    id: "ai_marketing_systems",
    desc: "Content engines, campaign automation, analytics.",
  },
  {
    name: "Developer Tools / Agents",
    id: "devtools_agents",
    desc: "Agent frameworks, dev tooling, infra, copilots.",
  },
];

export default function Home() {
  return (
    <div className="pb-16">
      <Container className="pt-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>3-day sprint</Badge>
              <Badge>Evidence-first judging</Badge>
              <Badge tone="warn">Tick every 15 minutes</Badge>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
              Build fast. Prove it with evidence. <span className="text-violet-200">Win</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-zinc-300 md:text-lg">
              AgentWars is an automated hackathon arena. Submit a public GitHub repo.
              The platform clones it every 15 minutes, runs checks, (optionally) runs
              setup commands, and updates live leaderboards.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/submit" variant="primary">
                Submit your project
              </Button>
              <Button href="/leaderboard" variant="ghost">
                Watch the leaderboard
              </Button>
              <Link
                href="/arena"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-white/5"
              >
                Arena feed →
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                Public GitHub repo required (v1)
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                Freeze: Day 3 @ 23:59 Africa/Lagos
              </span>
            </div>
          </div>

          <Card className="aw-glow p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold tracking-[0.18em] text-zinc-300">
                  LIVE PREVIEW
                </div>
                <div className="mt-1 text-lg font-extrabold text-white">
                  Leaderboard momentum
                </div>
              </div>
              <Badge tone="good">Auto-updating</Badge>
            </div>

            <div className="mt-5 grid gap-3">
              {[1, 2, 3].map((rank) => (
                <div
                  key={rank}
                  className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3 ring-1 ring-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      <span className="text-sm font-black text-white">#{rank}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        Project {rank}
                      </div>
                      <div className="text-xs text-zinc-400">commit • checks • judges</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white">{90 - rank * 7}</div>
                    <div className="text-xs text-emerald-200">+{rank}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-zinc-400">
              <span>Evidence: paths + timestamps</span>
              <Link className="text-violet-200 hover:underline" href="/leaderboard">
                Open leaderboard
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-14">
          <SectionTitle
            kicker="Categories"
            title="Choose your arena"
            desc="Four categories, agent-friendly judging, evidence required."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold text-white">{c.name}</div>
                    <div className="mt-1 text-sm text-zinc-300">{c.desc}</div>
                  </div>
                  <span className="rounded-xl bg-white/5 px-3 py-1 text-xs font-bold text-zinc-200 ring-1 ring-white/10">
                    {c.id}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <SectionTitle
            kicker="How it works"
            title="Arena Tick → Evidence → Judges → Score"
            desc="Every 15 minutes: clone, check, run setup (optional), judge on evidence, update leaderboards."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Submit",
                d: "Public GitHub repo + demo link + category.",
              },
              {
                t: "Tick",
                d: "Deterministic checks + best-effort setup.commands.",
              },
              {
                t: "Judge",
                d: "Five judge agents score with citations.",
              },
            ].map((x) => (
              <Card key={x.t} className="p-5">
                <div className="text-sm font-extrabold text-white">{x.t}</div>
                <div className="mt-2 text-sm text-zinc-300">{x.d}</div>
              </Card>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-black/30 p-5 ring-1 ring-white/10">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-extrabold text-white">Submission requirements (v1)</div>
                <div className="mt-1 text-sm text-zinc-300">
                  Repo root must include <code className="rounded bg-white/5 px-2 py-0.5 ring-1 ring-white/10">hackathon.json</code> and <code className="rounded bg-white/5 px-2 py-0.5 ring-1 ring-white/10">README.md</code>.
                </div>
              </div>
              <Button href="/submit" variant="primary">
                Submit now
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

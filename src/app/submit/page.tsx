"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from "react";
import { Badge, Button, Card, Container, SectionTitle } from "@/components/ui";

type Category =
  | "ai_sales_automation"
  | "ai_support_ops"
  | "ai_marketing_systems"
  | "devtools_agents";

type DemoType = "video" | "live";

export default function SubmitPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [demoType, setDemoType] = useState<DemoType>("video");
  const [category, setCategory] = useState<Category>("ai_sales_automation");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const canSubmit = useMemo(
    () => repoUrl.trim().length > 0 && demoUrl.trim().length > 0,
    [repoUrl, demoUrl]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, demoUrl, demoType, category }),
      });
      const json = await res.json();
      setResult({ status: res.status, json });

      if (res.ok) {
        setRepoUrl("");
        setDemoUrl("");
      }
    } catch (err: any) {
      setResult({ status: 0, json: { ok: false, error: err?.message || String(err) } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-16">
      <Container className="pt-12">
        <SectionTitle
          kicker="Join the arena"
          title="Submit your project"
          desc="Public GitHub repo + demo link. The tick worker evaluates every 15 minutes."
        />

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <Card className="p-6">
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-200">GitHub repo URL</label>
                <input
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  required
                />
                <div className="text-xs text-zinc-400">Repo must be public for v1.</div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-200">Category</label>
                <select
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  <option value="ai_sales_automation">AI Sales Automation</option>
                  <option value="ai_support_ops">AI Customer Support / Ops</option>
                  <option value="ai_marketing_systems">AI Marketing Systems</option>
                  <option value="devtools_agents">Developer Tools / Agents</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-200">Demo type</label>
                <select
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                  value={demoType}
                  onChange={(e) => setDemoType(e.target.value as DemoType)}
                >
                  <option value="video">Video</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-zinc-200">Demo URL</label>
                <input
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="https://..."
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  required
                />
              </div>

              <button
                disabled={!canSubmit || submitting}
                className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--aw-accent),var(--aw-accent2))] px-4 py-2 text-sm font-extrabold text-black shadow-[0_0_50px_rgba(124,58,237,0.18)] disabled:opacity-50"
                type="submit"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </form>

            {result ? (
              <pre className="mt-5 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : null}
          </Card>

          <div className="grid gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold text-white">Required files</div>
                <Badge tone="warn">Repo root</Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-zinc-300">
                <div>
                  <code className="rounded bg-white/5 px-2 py-1 ring-1 ring-white/10">hackathon.json</code>
                </div>
                <div>
                  <code className="rounded bg-white/5 px-2 py-1 ring-1 ring-white/10">README.md</code>
                </div>
                <div className="pt-2 text-xs text-zinc-400">
                  Optional: <code>judge.md</code> with demo timestamps.
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-extrabold text-white">Next step</div>
              <p className="mt-2 text-sm text-zinc-300">
                After submitting, run a tick to evaluate:
              </p>
              <pre className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-200">
                cd /root/.openclaw/workspace/projects/internal/agentwars/app
                <br />
                npm run tick
              </pre>
              <div className="mt-4">
                <Button href="/leaderboard" variant="ghost">
                  View leaderboard →
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

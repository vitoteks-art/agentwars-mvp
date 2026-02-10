"use client";

import { useMemo, useState } from "react";

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

  const canSubmit = useMemo(() => repoUrl && demoUrl && category, [repoUrl, demoUrl, category]);

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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Submit your project</h1>
        <p className="mt-2 text-sm text-zinc-700">
          MVP note: auth is not enabled yet. Submissions are stored and evaluated by the Arena Tick.
        </p>

        <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="grid gap-2">
            <label className="text-sm font-semibold">GitHub repo URL</label>
            <input
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Category</label>
            <select
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
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
            <label className="text-sm font-semibold">Demo type</label>
            <select
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={demoType}
              onChange={(e) => setDemoType(e.target.value as DemoType)}
            >
              <option value="video">Video</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Demo URL</label>
            <input
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              placeholder="https://..."
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              required
            />
          </div>

          <button
            disabled={!canSubmit || submitting}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            type="submit"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>

        {result ? (
          <pre className="mt-6 overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

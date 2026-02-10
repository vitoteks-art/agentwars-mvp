/*
  AgentWars v1 — Arena Tick worker (MVP)

  What it does (MVP):
  - For each active project, fetch latest commit SHA
  - Clone repo at SHA into a temp dir
  - Run deterministic checks: required files, hackathon.json schema, README presence
  - Best-effort demo reachability check
  - Best-effort setup.commands (timeboxed)
  - Store Evaluation Artifact JSON
  - Compute penalties + create Score row (judge scores are stubbed in MVP)

  Run:
    npm run tick
*/

import { prisma } from "@/lib/prisma";
import { HackathonJsonSchema } from "@/lib/hackathonSchema";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const execFileAsync = promisify(execFile);

function roundToQuarterHour(d: Date) {
  const ms = 15 * 60 * 1000;
  return new Date(Math.floor(d.getTime() / ms) * ms);
}

async function sh(cmd: string, args: string[], opts: { cwd?: string; timeoutMs?: number } = {}) {
  const { stdout, stderr } = await execFileAsync(cmd, args, {
    cwd: opts.cwd,
    timeout: opts.timeoutMs,
    maxBuffer: 5 * 1024 * 1024,
  });
  return { stdout: stdout?.toString() ?? "", stderr: stderr?.toString() ?? "" };
}

async function getLatestSha(repoUrl: string): Promise<string> {
  // Use git ls-remote to avoid GitHub API limits.
  const { stdout } = await sh("git", ["ls-remote", repoUrl, "HEAD"], { timeoutMs: 45_000 });
  const sha = stdout.trim().split(/\s+/)[0];
  if (!sha || sha.length < 7) throw new Error(`Could not resolve HEAD for ${repoUrl}`);
  return sha;
}

async function demoReachable(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal } as any);
    clearTimeout(t);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function getFileTreeSummary(root: string) {
  // Shallow file tree for evidence; avoid huge output.
  const out: string[] = [];
  async function walk(dir: string, depth: number) {
    if (depth > 3) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const full = path.join(dir, e.name);
      const rel = path.relative(root, full);
      out.push(rel + (e.isDirectory() ? "/" : ""));
      if (e.isDirectory()) await walk(full, depth + 1);
      if (out.length > 400) return;
    }
  }
  await walk(root, 0);
  return out;
}

async function runSetupCommands(repoDir: string, commands: string[]) {
  if (!commands?.length) {
    return { attempted: false, ok: true, log: "" };
  }

  let allOk = true;
  const logs: string[] = [];

  for (const c of commands) {
    const start = Date.now();
    try {
      // Run command in bash -lc for convenience.
      const { stdout, stderr } = await execFileAsync("bash", ["-lc", c], {
        cwd: repoDir,
        timeout: 90_000,
        maxBuffer: 5 * 1024 * 1024,
        env: {
          ...process.env,
          CI: "1",
          NODE_ENV: "production",
        },
      });
      logs.push(`$ ${c}\n${stdout}\n${stderr}`);
    } catch (e: any) {
      allOk = false;
      logs.push(`$ ${c}\nFAILED: ${e?.message || String(e)}\nSTDOUT:\n${e?.stdout || ""}\nSTDERR:\n${e?.stderr || ""}`);
    } finally {
      logs.push(`(elapsed ${(Date.now() - start) / 1000}s)\n---`);
    }
  }

  const log = logs.join("\n");
  return {
    attempted: true,
    ok: allOk,
    log: log.length > 20_000 ? log.slice(0, 20_000) + "\n...TRUNCATED" : log,
  };
}

function computePenalties(input: {
  missingHackathonJson: boolean;
  missingReadme: boolean;
  demoUnreachable: boolean;
  setupAllFailed: boolean;
}) {
  const penalties: { key: string; points: number; reason: string }[] = [];
  if (input.missingHackathonJson) penalties.push({ key: "missing_hackathon_json", points: 25, reason: "Missing hackathon.json" });
  if (input.missingReadme) penalties.push({ key: "missing_readme", points: 10, reason: "Missing README.md" });
  if (input.demoUnreachable) penalties.push({ key: "demo_unreachable", points: 15, reason: "Demo link missing/unreachable" });
  if (input.setupAllFailed) penalties.push({ key: "setup_failed", points: 5, reason: "Setup commands present but all failed" });
  const total = penalties.reduce((s, p) => s + p.points, 0);
  return { penalties, total };
}

async function main() {
  const tickAt = roundToQuarterHour(new Date());
  const tick = await prisma.tick.upsert({
    where: { tickAt },
    update: { status: "running" },
    create: { tickAt, status: "running" },
  });

  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
  });

  for (const project of projects) {
    const startedAt = Date.now();
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "agentwars-"));
    const repoDir = path.join(tmp, "repo");

    let commitSha = "";
    let requiredFilesOk = false;
    let hackathonJsonOk = false;
    let readmeOk = false;
    let hackathonJsonErrors: string | null = null;
    let readmeFindings: any = null;

    let demoOk = false;
    let demoErr: string | null = null;

    let setupAttempted = false;
    let setupOk = true;
    let setupLogTruncated: string | null = null;

    let fileTreeSummary: any = null;

    try {
      commitSha = await getLatestSha(project.repoUrl);

      await prisma.repoSnapshot.upsert({
        where: { projectId_tickId: { projectId: project.id, tickId: tick.id } },
        update: { commitSha },
        create: { projectId: project.id, tickId: tick.id, commitSha },
      });

      // Clone at SHA (shallow-ish). Note: git can't shallow by sha easily; clone then checkout.
      await sh("git", ["clone", "--no-tags", "--depth", "1", project.repoUrl, repoDir], { timeoutMs: 90_000 });
      await sh("git", ["checkout", commitSha], { cwd: repoDir, timeoutMs: 30_000 });

      const hackathonPath = path.join(repoDir, "hackathon.json");
      const readmePath = path.join(repoDir, "README.md");

      const hasHackathon = await fileExists(hackathonPath);
      const hasReadme = await fileExists(readmePath);
      requiredFilesOk = hasHackathon && hasReadme;
      readmeOk = hasReadme;

      if (hasReadme) {
        const readme = await fs.readFile(readmePath, "utf8");
        readmeFindings = {
          size: readme.length,
          hasDemoLink: /http(s)?:\/\//i.test(readme),
          hasRunSection: /how to run|setup|install/i.test(readme),
        };
      }

      let setupCommands: string[] = [];
      if (hasHackathon) {
        const raw = await fs.readFile(hackathonPath, "utf8");
        let json: any;
        try {
          json = JSON.parse(raw);
        } catch {
          hackathonJsonOk = false;
          hackathonJsonErrors = "hackathon.json is not valid JSON";
          json = null;
        }

        if (json) {
          const parsed = HackathonJsonSchema.safeParse(json);
          if (!parsed.success) {
            hackathonJsonOk = false;
            hackathonJsonErrors = parsed.error.message;
          } else {
            hackathonJsonOk = true;
            // Update project name/team/demo from hackathon.json (MVP convenience)
            await prisma.project.update({
              where: { id: project.id },
              data: {
                name: parsed.data.agentwars.name,
                team: parsed.data.agentwars.team,
              },
            });
            setupCommands = parsed.data.agentwars.setup?.commands ?? [];
          }
        }
      }

      const demoCheck = await demoReachable(project.demoUrl);
      demoOk = demoCheck.ok;
      demoErr = demoCheck.ok ? null : demoCheck.error || "unreachable";

      const setup = await runSetupCommands(repoDir, setupCommands);
      setupAttempted = setup.attempted;
      setupOk = setup.ok;
      setupLogTruncated = setup.log || null;

      fileTreeSummary = await getFileTreeSummary(repoDir);

      const artifact = {
        tickAt,
        repoUrl: project.repoUrl,
        commitSha,
        checks: {
          requiredFilesOk,
          hackathonJsonOk,
          readmeOk,
          demoOk,
          setupAttempted,
          setupOk,
        },
        errors: {
          hackathonJsonErrors,
          demoErr,
        },
        readmeFindings,
        fileTreeSummary,
        timingMs: { total: Date.now() - startedAt },
      };

      await prisma.evaluation.upsert({
        where: { projectId_tickId: { projectId: project.id, tickId: tick.id } },
        update: {
          commitSha,
          requiredFilesOk,
          hackathonJsonOk,
          hackathonJsonErrors,
          readmeOk,
          readmeFindings,
          demoReachable: demoOk,
          demoError: demoErr,
          setupAttempted,
          setupOk,
          setupLogTruncated,
          fileTreeSummary,
          artifactJson: artifact as any,
        },
        create: {
          projectId: project.id,
          tickId: tick.id,
          commitSha,
          requiredFilesOk,
          hackathonJsonOk,
          hackathonJsonErrors,
          readmeOk,
          readmeFindings,
          demoReachable: demoOk,
          demoError: demoErr,
          setupAttempted,
          setupOk,
          setupLogTruncated,
          fileTreeSummary,
          artifactJson: artifact as any,
        },
      });

      // MVP scoring: deterministic-only, with judges stubbed.
      const penalties = computePenalties({
        missingHackathonJson: !hackathonJsonOk,
        missingReadme: !readmeOk,
        demoUnreachable: !demoOk,
        setupAllFailed: setupAttempted && !setupOk,
      });

      const base = 0; // Judges will contribute to base. For MVP keep base 0.
      const totalScore = Math.max(0, base - penalties.total);

      const prev = await prisma.score.findFirst({
        where: { projectId: project.id },
        orderBy: { createdAt: "desc" },
        select: { totalScore: true },
      });
      const deltaVsPrev = prev ? totalScore - prev.totalScore : totalScore;

      await prisma.score.upsert({
        where: { projectId_tickId: { projectId: project.id, tickId: tick.id } },
        update: {
          commitSha,
          totalScore,
          deltaVsPrev,
          breakdownJson: { base, judges: null, note: "MVP deterministic-only" } as any,
          penaltiesJson: { penalties: penalties.penalties } as any,
        },
        create: {
          projectId: project.id,
          tickId: tick.id,
          commitSha,
          totalScore,
          deltaVsPrev,
          breakdownJson: { base, judges: null, note: "MVP deterministic-only" } as any,
          penaltiesJson: { penalties: penalties.penalties } as any,
        },
      });

      await prisma.arenaEvent.create({
        data: {
          projectId: project.id,
          tickId: tick.id,
          type: requiredFilesOk ? "score_updated" : "requirements_missing",
          payloadJson: {
            commitSha,
            requiredFilesOk,
            hackathonJsonOk,
            readmeOk,
            demoOk,
            setupOk,
            totalScore,
          } as any,
        },
      });
    } catch (e: any) {
      await prisma.arenaEvent.create({
        data: {
          projectId: project.id,
          tickId: tick.id,
          type: "setup_failed",
          payloadJson: { error: e?.message || String(e) } as any,
        },
      });
    } finally {
      await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
    }
  }

  await prisma.tick.update({ where: { id: tick.id }, data: { status: "done" } });
}

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Tick complete");
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });

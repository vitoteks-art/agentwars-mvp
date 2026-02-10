/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || "";

  const where = category
    ? { category: category as any, status: "active" as const }
    : { status: "active" as const };

  // Pull latest score per project (simple MVP approach).
  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      team: true,
      category: true,
      repoUrl: true,
      demoUrl: true,
      status: true,
      scores: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          totalScore: true,
          deltaVsPrev: true,
          breakdownJson: true,
          createdAt: true,
        },
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
        name: p.name,
        team: p.team,
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

  return NextResponse.json({ ok: true, rows });
}

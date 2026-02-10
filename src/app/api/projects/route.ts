import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateProjectSchema } from "@/lib/validation";

// MVP note:
// - No auth yet. Add auth before public launch.
// - ownerId is set to a placeholder admin user.

async function ensureMvpOwner() {
  const email = process.env.MVP_OWNER_EMAIL || "mvp-owner@agentwars.local";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: "MVP_NO_AUTH",
        role: "admin",
      },
    });
  }
  return user;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const owner = await ensureMvpOwner();

  const project = await prisma.project.create({
    data: {
      ownerId: owner.id,
      repoUrl: parsed.data.repoUrl,
      category: parsed.data.category,
      demoUrl: parsed.data.demoUrl,
      demoType: parsed.data.demoType,
      status: "active",
    },
    select: {
      id: true,
      repoUrl: true,
      category: true,
      demoUrl: true,
      demoType: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, project });
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      team: true,
      category: true,
      repoUrl: true,
      demoUrl: true,
      status: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ ok: true, projects });
}

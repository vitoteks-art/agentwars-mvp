import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.arenaEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { project: { select: { name: true } } },
  });
  return NextResponse.json({ ok: true, events });
}

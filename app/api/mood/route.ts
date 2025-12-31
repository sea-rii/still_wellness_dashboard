import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clamp, startOfDay, addDays } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30";
  const days = clamp(parseInt(range, 10) || 30, 7, 365);

  const today = startOfDay(new Date());
  const from = addDays(today, -days + 1);

  const data = await prisma.moodEntry.findMany({
    where: { userId, date: { gte: from, lte: today } },
    orderBy: { date: "asc" },
    include: { tags: { select: { tag: true } } },
  });

  return NextResponse.json({ days, data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const moodScore = clamp(Number(body.moodScore), -2, 2);
  const intensity = clamp(Number(body.intensity), 1, 5);
  const tags: string[] = Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).toLowerCase()) : [];
  const note: string | undefined = body.note ? String(body.note) : undefined;

  const date = startOfDay(new Date());

  const saved = await prisma.moodEntry.upsert({
    where: { userId_date: { userId, date } },
    update: {
      moodScore,
      intensity,
      note,
      tags: {
        deleteMany: {},
        create: tags.slice(0, 12).map(tag => ({ tag })),
      },
    },
    create: {
      userId,
      date,
      moodScore,
      intensity,
      note,
      tags: { create: tags.slice(0, 12).map(tag => ({ tag })) },
    },
    include: { tags: { select: { tag: true } } },
  });

  return NextResponse.json({ saved });
}

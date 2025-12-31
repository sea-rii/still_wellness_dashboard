import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId,
      ...(q
        ? {
            OR: [
              { text: { contains: q, mode: "insensitive" } },
              { prompt: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { date: "desc" },
    select: { id: true, date: true, prompt: true, text: true },
    take: 100,
  });

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const prompt = body.prompt ? String(body.prompt) : null;
  const text = String(body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

  const date = startOfDay(new Date());

  const saved = await prisma.journalEntry.create({
    data: { userId, date, prompt, text },
    select: { id: true, date: true, prompt: true, text: true },
  });

  return NextResponse.json({ saved });
}

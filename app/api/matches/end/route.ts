import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json({ error: "Brak matchId" }, { status: 400 });
    }

    // Update match status to ended
    const match = await prisma.match.update({
      where: { matchId },
      data: { status: "ended" },
    });

    return NextResponse.json({
      matchId: match.matchId,
      status: match.status,
    });
  } catch (error) {
    console.error("End match error:", error);
    return NextResponse.json({ error: "Failed to end match" }, { status: 500 });
  }
}

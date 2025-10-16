import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();

    // Get all matches ordered by date
    const matches = await prisma.match.findMany({
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });

    // Find previous match
    const currentIndex = matches.findIndex((m) => m.matchId === matchId);
    const prevMatch =
      currentIndex > 0
        ? matches[currentIndex - 1]
        : matches[matches.length - 1];

    if (!prevMatch) {
      return NextResponse.json([]);
    }

    const roster = await prisma.matchRoster.findMany({
      where: { matchId: prevMatch.matchId },
      orderBy: { number: "asc" },
    });

    return NextResponse.json(
      roster.map((r) => ({
        player_id: r.playerId,
        number: r.number,
        name: r.name,
        team: r.team,
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get previous roster" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const matchId = params.matchId;
    const roster = await prisma.matchRoster.findMany({
      where: { matchId },
      orderBy: { number: "asc" },
    });

    return NextResponse.json(
      roster.map((r) => ({
        match_id: r.matchId,
        player_id: r.playerId,
        number: r.number,
        name: r.name,
        team: r.team,
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get roster" },
      { status: 500 }
    );
  }
}

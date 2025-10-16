import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { number: "asc" },
    });

    return NextResponse.json(
      players.map((p) => ({
        player_id: p.playerId,
        number: p.number,
        name: p.name,
        team: p.team,
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get players" },
      { status: 500 }
    );
  }
}

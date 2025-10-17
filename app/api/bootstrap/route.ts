import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET() {
  // Force fresh data - no caching
  const headers = new Headers();
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const players = await prisma.player.findMany({
      orderBy: { number: "asc" },
    });
    const matches = await prisma.match.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
    });

    let rosterActive: any[] = [];
    if (settings?.activeMatch) {
      rosterActive = await prisma.matchRoster.findMany({
        where: { matchId: settings.activeMatch },
        orderBy: { number: "asc" },
      });
    }

    return NextResponse.json(
      {
        settings: {
          ActiveMatch: settings?.activeMatch || "",
          Quarter: settings?.quarter || 1,
        },
        players: players.map((p: any) => ({
          player_id: p.playerId,
          number: p.number,
          name: p.name,
          team: p.team,
        })),
        matches: matches.map((m: any) => ({
          match_id: m.matchId,
          date: m.date,
          opponent: m.opponent,
          place: m.place,
          ageCategory: m.ageCategory,
          status: m.status,
        })),
        user: { email: "", role: "editor" }, // Simplified - always editor
        rosterActive: rosterActive.map((r) => ({
          match_id: r.matchId,
          player_id: r.playerId,
          number: r.number,
          name: r.name,
          team: r.team,
        })),
      },
      { headers }
    );
  } catch (error) {
    logger.error("Bootstrap error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}

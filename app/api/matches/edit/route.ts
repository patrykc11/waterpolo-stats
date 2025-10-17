import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  let matchId: string | undefined;

  try {
    const body = await request.json();
    const { date, opponent, place, ageCategory } = body;
    matchId = body.matchId;

    if (!matchId) {
      return NextResponse.json({ error: "Brak matchId" }, { status: 400 });
    }

    // Update match details
    const match = await prisma.match.update({
      where: { matchId },
      data: {
        date: date || "",
        opponent: opponent || "",
        place: place || "",
        ageCategory: ageCategory || "Seniorzy",
      },
    });

    logger.info("Match edited successfully", {
      matchId: match.matchId,
      changes: { date, opponent, place, ageCategory },
    });
    return NextResponse.json({
      match_id: match.matchId,
      date: match.date,
      opponent: match.opponent,
      place: match.place,
      ageCategory: match.ageCategory,
      status: match.status,
    });
  } catch (error) {
    logger.error("Edit match error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      matchId: matchId || "unknown",
    });
    return NextResponse.json(
      { error: "Failed to edit match" },
      { status: 500 }
    );
  }
}

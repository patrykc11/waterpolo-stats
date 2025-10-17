import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  let matchId: string | undefined;

  try {
    const body = await request.json();
    matchId = body.matchId;

    if (!matchId) {
      return NextResponse.json({ error: "Brak matchId" }, { status: 400 });
    }

    // Archive match (soft delete)
    const match = await prisma.match.update({
      where: { matchId },
      data: { archived: true },
    });

    logger.info("Match archived successfully", { matchId: match.matchId });
    return NextResponse.json({
      matchId: match.matchId,
      archived: match.archived,
    });
  } catch (error) {
    logger.error("Archive match error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      matchId: matchId || "unknown",
    });
    return NextResponse.json(
      { error: "Failed to archive match" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  let matchId: string | undefined;
  let quarter: string | undefined;

  try {
    const body = await request.json();
    matchId = body.matchId;
    quarter = body.quarter;
    const { myScore, oppScore } = body;

    logger.info("POST /api/stats/score - Saving score", {
      matchId,
      quarter,
      myScore,
      oppScore,
    });

    const updateData: any = {};

    if (String(quarter) === "final") {
      updateData.finalMy = Number(myScore);
      updateData.finalOpp = Number(oppScore);
    } else {
      const q = Number(quarter);
      updateData[`q${q}My`] = Number(myScore);
      updateData[`q${q}Opp`] = Number(oppScore);
    }

    const match = await prisma.match.update({
      where: { matchId },
      data: updateData,
    });

    const scores = {
      "1": { my: match.q1My, opp: match.q1Opp },
      "2": { my: match.q2My, opp: match.q2Opp },
      "3": { my: match.q3My, opp: match.q3Opp },
      "4": { my: match.q4My, opp: match.q4Opp },
      final: { my: match.finalMy, opp: match.finalOpp },
    };

    logger.info("POST /api/stats/score - Score saved successfully", {
      matchId,
      quarter,
      scores,
    });

    return NextResponse.json(scores);
  } catch (error) {
    logger.error("POST /api/stats/score - Failed to save score", {
      error,
      matchId,
      quarter,
    });
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}

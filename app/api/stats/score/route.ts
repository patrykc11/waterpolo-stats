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

    // Scores in database are cumulative (score at end of each quarter)
    // Calculate per-quarter differences for display
    const q1My = match.q1My || 0;
    const q1Opp = match.q1Opp || 0;
    const q2My = match.q2My || 0;
    const q2Opp = match.q2Opp || 0;
    const q3My = match.q3My || 0;
    const q3Opp = match.q3Opp || 0;
    const q4My = match.q4My || 0;
    const q4Opp = match.q4Opp || 0;

    const scores = {
      "1": { my: q1My, opp: q1Opp }, // Q1 is already per-quarter
      "2": { my: q2My - q1My, opp: q2Opp - q1Opp }, // Difference from Q1
      "3": { my: q3My - q2My, opp: q3Opp - q2Opp }, // Difference from Q2
      "4": { my: q4My - q3My, opp: q4Opp - q3Opp }, // Difference from Q3
      final: {
        my: match.finalMy || q4My,
        opp: match.finalOpp || q4Opp,
      }, // Final score (use q4 if final not set)
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

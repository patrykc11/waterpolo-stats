import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  // Force fresh data - no caching
  const headers = new Headers();
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  try {
    const matchId = params.matchId;
    console.log("Stats API called for matchId:", matchId); // Debug log

    // Get all events for this match
    const events = await prisma.event.findMany({
      where: { matchId },
      orderBy: { timestamp: "asc" },
    });

    // Get roster for this match
    const roster = await prisma.matchRoster.findMany({
      where: { matchId },
      orderBy: { number: "asc" },
    });

    // Get match scores
    const match = await prisma.match.findUnique({
      where: { matchId },
    });

    // Scores in database are cumulative (score at end of each quarter)
    // Calculate per-quarter differences for display
    const q1My = match?.q1My || 0;
    const q1Opp = match?.q1Opp || 0;
    const q2My = match?.q2My || 0;
    const q2Opp = match?.q2Opp || 0;
    const q3My = match?.q3My || 0;
    const q3Opp = match?.q3Opp || 0;
    const q4My = match?.q4My || 0;
    const q4Opp = match?.q4Opp || 0;

    const scores = {
      "1": { my: q1My, opp: q1Opp }, // Q1 is already per-quarter
      "2": { my: q2My - q1My, opp: q2Opp - q1Opp }, // Difference from Q1
      "3": { my: q3My - q2My, opp: q3Opp - q2Opp }, // Difference from Q2
      "4": { my: q4My - q3My, opp: q4Opp - q3Opp }, // Difference from Q3
      final: { 
        my: match?.finalMy || q4My, 
        opp: match?.finalOpp || q4Opp 
      }, // Final score (use q4 if final not set)
    };

    // Compute stats - 44 fields matching assistant buttons
    const flagFields = [
      // ATAK POZYCYJNY (15)
      "isGoalFromPlayPositional",
      "isGoalFromPlayCounter",
      "isGoalFromCenterPositional",
      "isAssistPositional",
      "isShotSavedGkPositional",
      "isShotMissTurnoverPositional",
      "isShotMissReset30Positional",
      "isBadPassTurnoverPositional",
      "isBadPassNoTurnoverPositional",
      "isTurnover1v1Positional",
      "isShotClockViolationPositional",
      "isExclDrawnFieldPositional",
      "isExclDrawnCenterPositional",
      "isPenaltyDrawnFieldPositional",
      "isPenaltyDrawnCenterPositional",
      // ATAK PRZEWAGA (10)
      "isGoalFromCenterManUp",
      "isGoal5mManUp",
      "isAssistManUp",
      "isShotSavedGkManUp",
      "isShotMissTurnoverManUp",
      "isShotMissReset30ManUp",
      "isBadPassTurnoverManUp",
      "isBadPassNoTurnoverManUp",
      "isTurnover1v1ManUp",
      "isShotClockViolationManUp",
      // RZUTY KARNE (1)
      "isGoal5mPenalty",
      // OBRONA POZYCYJNA (9)
      "isNoReturnPositional",
      "isExclCommittedFieldPositional",
      "isExclCommittedCenterPositional",
      "isPenaltyCommittedFieldPositional",
      "isPenaltyCommittedCenterPositional",
      "isShotSavedGkDefPositional",
      "isStealPositional",
      "isBlockHandPositional",
      "isNoBlockPositional",
      // OBRONA PRZEWAGA (9)
      "isNoReturnManUp",
      "isExclCommittedFieldManUp",
      "isExclCommittedCenterManUp",
      "isPenaltyCommittedFieldManUp",
      "isPenaltyCommittedCenterManUp",
      "isShotSavedGkDefManUp",
      "isStealManUp",
      "isBlockHandManUp",
      "isNoBlockManUp",
    ];

    const flagsSnakeCase = flagFields.map(camelToSnake);

    const zeroFlags = () => {
      const obj: any = {};
      flagsSnakeCase.forEach((f) => {
        obj[f] = 0;
      });
      return obj;
    };

    const totalsAll = zeroFlags();
    const totalsByQ: any = {
      "1": zeroFlags(),
      "2": zeroFlags(),
      "3": zeroFlags(),
      "4": zeroFlags(),
    };
    const perPlayerAll: any = {};
    const perPlayerByQ: any = { "1": {}, "2": {}, "3": {}, "4": {} };

    for (const ev of events) {
      const q = String(ev.quarter);
      const pid = ev.playerId;

      flagFields.forEach((field, idx) => {
        const snakeKey = flagsSnakeCase[idx];
        const val = (ev as any)[field] || 0;

        totalsAll[snakeKey] += val;
        if (["1", "2", "3", "4"].includes(q)) {
          totalsByQ[q][snakeKey] += val;
        }

        if (!perPlayerAll[pid]) perPlayerAll[pid] = zeroFlags();
        perPlayerAll[pid][snakeKey] += val;

        if (["1", "2", "3", "4"].includes(q)) {
          if (!perPlayerByQ[q][pid]) perPlayerByQ[q][pid] = zeroFlags();
          perPlayerByQ[q][pid][snakeKey] += val;
        }
      });
    }

    const result = {
      flags: flagsSnakeCase,
      players: roster.map((r) => ({
        player_id: r.playerId,
        number: r.number,
        name: r.name,
        team: r.team,
      })),
      perPlayerAll,
      perPlayerByQ,
      totalsAll,
      totalsByQ,
      scores,
    };

    console.log(
      "Stats API returning for matchId:",
      matchId,
      "with",
      events.length,
      "events"
    ); // Debug log
    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}

function camelToSnake(str: string): string {
  // Special case for fields with numbers like "5m" and "1v1"
  return str
    .replace(/5m/g, "_5m_")
    .replace(/1v1/g, "_1v1_")
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/__/g, "_") // Remove double underscores
    .replace(/^_/, ""); // Remove leading underscore
}

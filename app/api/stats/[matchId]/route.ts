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

    const scores = {
      "1": { my: match?.q1My || 0, opp: match?.q1Opp || 0 },
      "2": { my: match?.q2My || 0, opp: match?.q2Opp || 0 },
      "3": { my: match?.q3My || 0, opp: match?.q3Opp || 0 },
      "4": { my: match?.q4My || 0, opp: match?.q4Opp || 0 },
      final: { my: match?.finalMy || 0, opp: match?.finalOpp || 0 },
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

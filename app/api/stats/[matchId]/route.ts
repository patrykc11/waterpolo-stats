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

    // Compute stats
    const flagFields = [
      "isGoalFromPlay",
      "isGoalFromCenter",
      "isGoalPutback",
      "isGoal5m",
      "isAssist",
      "isExclDrawn",
      "isExclCommitted",
      "isPenaltyDrawn",
      "isPenaltyCommitted",
      "isTurnover",
      "isTurnover1v1",
      "isShotSavedGk",
      "isShotMissTurnover",
      "isShotMissReset30",
      "isBadPassTurnover",
      "isBadPassNoTurnover",
      "isShotClockViolation",
      "isSteal",
      "isBlockHand",
      "isNoBlock",
      "isNoReturn",
      "isGoalCounter",
      "isShotOut",
      "isBadPass2m",
      "isPressWin",
      "isInterception",
    ];

    const flagsSnakeCase = flagFields.map(camelToSnake);

    const zeroFlags = () => {
      const obj: any = {};
      flagsSnakeCase.forEach((f) => (obj[f] = 0));
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
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

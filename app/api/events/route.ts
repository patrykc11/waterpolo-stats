import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { events } = await request.json();

    const settings = await prisma.settings.findUnique({ where: { id: 1 } });

    const eventsData = events.map((ev: any) => ({
      matchId: ev.match_id || settings?.activeMatch || "",
      quarter: Number(ev.quarter || settings?.quarter || 1),
      team: ev.team || "my",
      playerId: ev.player_id || "",
      playerName: ev.player_name || "",
      eventType: ev.event_type || "",
      subtype: ev.subtype || "",
      value: ev.value || "",
      note: ev.note || "",
      phase: ev.phase || "positional",
      location: ev.location || "",
      shotZone: ev.shot_zone || "",

      // Map all flag fields directly
      isGoalFromPlay: ev.is_goal_from_play || 0,
      isGoalFromCenter: ev.is_goal_from_center || 0,
      isGoalPutback: ev.is_goal_putback || 0,
      isGoal5m: ev.is_goal_5m || 0,
      isAssist: ev.is_assist || 0,
      isExclDrawn: ev.is_excl_drawn || 0,
      exclDrawnLocation: ev.excl_drawn_location || "",
      isExclCommitted: ev.is_excl_committed || 0,
      exclCommittedLocation: ev.excl_committed_location || "",
      isPenaltyDrawn: ev.is_penalty_drawn || 0,
      penaltyDrawnLocation: ev.penalty_drawn_location || "",
      isPenaltyCommitted: ev.is_penalty_committed || 0,
      penaltyCommittedLocation: ev.penalty_committed_location || "",
      isTurnover: ev.is_turnover || 0,
      isTurnover1v1: ev.is_turnover_1v1 || 0,
      isShotSavedGk: ev.is_shot_saved_gk || 0,
      isShotMissTurnover: ev.is_shot_miss_turnover || 0,
      isShotMissReset30: ev.is_shot_miss_reset30 || 0,
      isBadPassTurnover: ev.is_bad_pass_turnover || 0,
      isBadPassNoTurnover: ev.is_bad_pass_no_turnover || 0,
      isShotClockViolation: ev.is_shot_clock_violation || 0,
      isSteal: ev.is_steal || 0,
      isBlockHand: ev.is_block_hand || 0,
      isNoBlock: ev.is_no_block || 0,
      isNoReturn: ev.is_no_return || 0,
      isGoalCounter: ev.is_goal_counter || 0,
      isShotOut: ev.is_shot_out || 0,
      isBadPass2m: ev.is_bad_pass_2m || 0,
      isPressWin: ev.is_press_win || 0,
      isInterception: ev.is_interception || 0,
    }));

    await prisma.event.createMany({ data: eventsData });

    return NextResponse.json({ ok: true, count: eventsData.length });
  } catch (error) {
    console.error("Events error:", error);
    return NextResponse.json(
      { error: "Failed to save events" },
      { status: 500 }
    );
  }
}

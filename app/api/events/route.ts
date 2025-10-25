import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { events } = await request.json();
    // logger.info("POST /api/events - Received events", {
    //   count: events?.length || 0,
    // });

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

      // ATAK POZYCYJNY (15 pól)
      isGoalFromPlayPositional: ev.is_goal_from_play_positional || 0,
      isGoalFromPlayCounter: ev.is_goal_from_play_counter || 0,
      isGoalFromCenterPositional: ev.is_goal_from_center_positional || 0,
      isAssistPositional: ev.is_assist_positional || 0,
      isShotSavedGkPositional: ev.is_shot_saved_gk_positional || 0,
      isShotMissTurnoverPositional: ev.is_shot_miss_turnover_positional || 0,
      isShotMissReset30Positional: ev.is_shot_miss_reset30_positional || 0,
      isBadPassTurnoverPositional: ev.is_bad_pass_turnover_positional || 0,
      isBadPassNoTurnoverPositional: ev.is_bad_pass_no_turnover_positional || 0,
      isTurnover1v1Positional: ev.is_turnover_1v1_positional || 0,
      isShotClockViolationPositional:
        ev.is_shot_clock_violation_positional || 0,
      isExclDrawnFieldPositional: ev.is_excl_drawn_field_positional || 0,
      isExclDrawnCenterPositional: ev.is_excl_drawn_center_positional || 0,
      isPenaltyDrawnFieldPositional: ev.is_penalty_drawn_field_positional || 0,
      isPenaltyDrawnCenterPositional:
        ev.is_penalty_drawn_center_positional || 0,

      // ATAK PRZEWAGA (10 pól)
      isGoalFromCenterManUp: ev.is_goal_from_center_man_up || 0,
      isGoal5mManUp: ev.is_goal_5m_man_up || 0,
      isAssistManUp: ev.is_assist_man_up || 0,
      isShotSavedGkManUp: ev.is_shot_saved_gk_man_up || 0,
      isShotMissTurnoverManUp: ev.is_shot_miss_turnover_man_up || 0,
      isShotMissReset30ManUp: ev.is_shot_miss_reset30_man_up || 0,
      isBadPassTurnoverManUp: ev.is_bad_pass_turnover_man_up || 0,
      isBadPassNoTurnoverManUp: ev.is_bad_pass_no_turnover_man_up || 0,
      isTurnover1v1ManUp: ev.is_turnover_1v1_man_up || 0,
      isShotClockViolationManUp: ev.is_shot_clock_violation_man_up || 0,

      // RZUTY KARNE (1 pole)
      isGoal5mPenalty: ev.is_goal_5m_penalty || 0,

      // OBRONA POZYCYJNA (9 pól)
      isNoReturnPositional: ev.is_no_return_positional || 0,
      isExclCommittedFieldPositional:
        ev.is_excl_committed_field_positional || 0,
      isExclCommittedCenterPositional:
        ev.is_excl_committed_center_positional || 0,
      isPenaltyCommittedFieldPositional:
        ev.is_penalty_committed_field_positional || 0,
      isPenaltyCommittedCenterPositional:
        ev.is_penalty_committed_center_positional || 0,
      isShotSavedGkDefPositional: ev.is_shot_saved_gk_def_positional || 0,
      isStealPositional: ev.is_steal_positional || 0,
      isBlockHandPositional: ev.is_block_hand_positional || 0,
      isNoBlockPositional: ev.is_no_block_positional || 0,

      // OBRONA PRZEWAGA (9 pól)
      isNoReturnManUp: ev.is_no_return_man_up || 0,
      isExclCommittedFieldManUp: ev.is_excl_committed_field_man_up || 0,
      isExclCommittedCenterManUp: ev.is_excl_committed_center_man_up || 0,
      isPenaltyCommittedFieldManUp: ev.is_penalty_committed_field_man_up || 0,
      isPenaltyCommittedCenterManUp: ev.is_penalty_committed_center_man_up || 0,
      isShotSavedGkDefManUp: ev.is_shot_saved_gk_def_man_up || 0,
      isStealManUp: ev.is_steal_man_up || 0,
      isBlockHandManUp: ev.is_block_hand_man_up || 0,
      isNoBlockManUp: ev.is_no_block_man_up || 0,
    }));

    await prisma.event.createMany({ data: eventsData });

    logger.info("POST /api/events - Events saved successfully", {
      count: eventsData.length,
      matchId: settings?.activeMatch,
      quarter: settings?.quarter,
    });
    return NextResponse.json({ ok: true, count: eventsData.length });
  } catch (error) {
    logger.error("Events error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to save events" },
      { status: 500 }
    );
  }
}

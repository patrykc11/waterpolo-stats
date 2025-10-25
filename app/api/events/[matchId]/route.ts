import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const matchId = params.matchId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get recent events for this match
    const events = await prisma.event.findMany({
      where: { matchId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    // Format events for display
    const formattedEvents = events.map((event) => ({
      id: event.id,
      timestamp: event.timestamp,
      quarter: event.quarter,
      playerName: event.playerName,
      eventType: event.eventType,
      note: event.note,
      // Get the first non-zero flag to determine what happened
      action: getEventAction(event),
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: "Failed to get events" },
      { status: 500 }
    );
  }
}

function getEventAction(event: any): string {
  // Check all possible event flags and return the first one that's set
  const flags = [
    { key: "isGoalFromPlayPositional", label: "G z akcji (poz.)" },
    { key: "isGoalFromPlayCounter", label: "G z kontrataku" },
    { key: "isGoalFromCenterPositional", label: "G z centra (poz.)" },
    { key: "isGoalFromCenterManUp", label: "G z centra (przew.)" },
    { key: "isGoal5mManUp", label: "G z 5m (przew.)" },
    { key: "isGoal5mPenalty", label: "G z karnego" },
    { key: "isAssistPositional", label: "Asysta (poz.)" },
    { key: "isAssistManUp", label: "Asysta (przew.)" },
    { key: "isShotSavedGkPositional", label: "Obrona GK (poz.)" },
    { key: "isShotSavedGkManUp", label: "Obrona GK (przew.)" },
    {
      key: "isShotMissTurnoverPositional",
      label: "Niecelny rzut - strata (poz.)",
    },
    {
      key: "isShotMissTurnoverManUp",
      label: "Niecelny rzut - strata (przew.)",
    },
    { key: "isShotMissReset30Positional", label: "Niecelny rzut - 30s (poz.)" },
    { key: "isShotMissReset30ManUp", label: "Niecelny rzut - 30s (przew.)" },
    {
      key: "isBadPassTurnoverPositional",
      label: "Złe podanie - strata (poz.)",
    },
    { key: "isBadPassTurnoverManUp", label: "Złe podanie - strata (przew.)" },
    {
      key: "isBadPassNoTurnoverPositional",
      label: "Złe podanie - bez straty (poz.)",
    },
    {
      key: "isBadPassNoTurnoverManUp",
      label: "Złe podanie - bez straty (przew.)",
    },
    { key: "isTurnover1v1Positional", label: "Strata 1:1 (poz.)" },
    { key: "isTurnover1v1ManUp", label: "Strata 1:1 (przew.)" },
    { key: "isShotClockViolationPositional", label: "Koniec czasu (poz.)" },
    { key: "isShotClockViolationManUp", label: "Koniec czasu (przew.)" },
    {
      key: "isExclDrawnFieldPositional",
      label: "Sprow. wykl. - w polu (poz.)",
    },
    {
      key: "isExclDrawnCenterPositional",
      label: "Sprow. wykl. - z centra (poz.)",
    },
    {
      key: "isPenaltyDrawnFieldPositional",
      label: "Sprow. karny - w polu (poz.)",
    },
    {
      key: "isPenaltyDrawnCenterPositional",
      label: "Sprow. karny - z centra (poz.)",
    },
    { key: "isNoReturnPositional", label: "Brak powrotu (poz.)" },
    { key: "isNoReturnManUp", label: "Brak powrotu (przew.)" },
    {
      key: "isExclCommittedFieldPositional",
      label: "Wykl. spowod. - w polu (poz.)",
    },
    {
      key: "isExclCommittedFieldManUp",
      label: "Wykl. spowod. - w polu (przew.)",
    },
    {
      key: "isExclCommittedCenterPositional",
      label: "Wykl. spowod. - z centra (poz.)",
    },
    {
      key: "isExclCommittedCenterManUp",
      label: "Wykl. spowod. - z centra (przew.)",
    },
    {
      key: "isPenaltyCommittedFieldPositional",
      label: "Karny spowod. - w polu (poz.)",
    },
    {
      key: "isPenaltyCommittedFieldManUp",
      label: "Karny spowod. - w polu (przew.)",
    },
    {
      key: "isPenaltyCommittedCenterPositional",
      label: "Karny spowod. - z centra (poz.)",
    },
    {
      key: "isPenaltyCommittedCenterManUp",
      label: "Karny spowod. - z centra (przew.)",
    },
    { key: "isShotSavedGkDefPositional", label: "Obrona GK def (poz.)" },
    { key: "isShotSavedGkDefManUp", label: "Obrona GK def (przew.)" },
    { key: "isStealPositional", label: "Przejęcie (poz.)" },
    { key: "isStealManUp", label: "Przejęcie (przew.)" },
    { key: "isBlockHandPositional", label: "Blok (poz.)" },
    { key: "isBlockHandManUp", label: "Blok (przew.)" },
    { key: "isNoBlockPositional", label: "Brak bloku (poz.)" },
    { key: "isNoBlockManUp", label: "Brak bloku (przew.)" },
  ];

  for (const flag of flags) {
    if (event[flag.key] === 1) {
      return flag.label;
    }
  }

  return "Nieznana akcja";
}

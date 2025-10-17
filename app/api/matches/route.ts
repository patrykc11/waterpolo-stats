import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      matches.map((m) => ({
        match_id: m.matchId,
        date: m.date,
        opponent: m.opponent,
        place: m.place,
        ageCategory: m.ageCategory,
        status: m.status,
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { match, roster } = await request.json();

    // Generate match_id if not provided
    const matchId = match?.match_id || `match_${Date.now()}`;

    const matchData = {
      date: match?.date || "",
      opponent: match?.opponent || "",
      place: match?.place || "",
      ageCategory: match?.ageCategory || "Seniorzy",
    };

    // Upsert match
    await prisma.match.upsert({
      where: { matchId: matchId },
      update: matchData,
      create: {
        matchId: matchId,
        ...matchData,
      },
    });

    // Delete existing roster entries for this match
    await prisma.matchRoster.deleteMany({
      where: { matchId: matchId },
    });

    // Create new roster entries
    if (roster && roster.length) {
      await prisma.matchRoster.createMany({
        data: roster.map((p: any) => ({
          matchId: matchId,
          playerId: p.player_id,
          number: Number(p.number || 0),
          name: p.name || "",
          team: p.team || "my",
        })),
      });
    }

    const matches = await prisma.match.findMany({
      orderBy: { createdAt: "desc" },
    });

    const rosterData = await prisma.matchRoster.findMany({
      where: { matchId: matchId },
      orderBy: { number: "asc" },
    });

    return NextResponse.json({
      matchId,
      matches: matches.map((m) => ({
        match_id: m.matchId,
        date: m.date,
        opponent: m.opponent,
        place: m.place,
        ageCategory: m.ageCategory,
        status: m.status,
      })),
      roster: rosterData.map((r) => ({
        match_id: r.matchId,
        player_id: r.playerId,
        number: r.number,
        name: r.name,
        team: r.team,
      })),
    });
  } catch (error) {
    console.error("Match create error:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}

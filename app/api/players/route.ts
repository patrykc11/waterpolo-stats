import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { number: "asc" },
    });

    return NextResponse.json(
      players.map((p) => ({
        player_id: p.playerId,
        number: p.number,
        name: p.name,
        team: p.team,
      }))
    );
  } catch (error) {
    logger.error("Get players error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to get players" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { number, name, team = "my" } = await request.json();

    if (!number || !name) {
      return NextResponse.json(
        { error: "Number and name are required" },
        { status: 400 }
      );
    }

    // Check if player with this number already exists
    const existingPlayer = await prisma.player.findFirst({
      where: { number: parseInt(number) },
    });

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Player with this number already exists" },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        playerId: `player_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        number: parseInt(number),
        name,
        team,
      },
    });

    logger.info("Player created successfully", {
      playerId: player.playerId,
      name: player.name,
      number: player.number,
    });
    return NextResponse.json({
      player_id: player.playerId,
      number: player.number,
      name: player.name,
      team: player.team,
    });
  } catch (error) {
    logger.error("Player create error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { player_id } = await request.json();

    if (!player_id) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // Delete player and all related data
    await prisma.player.delete({
      where: { playerId: player_id },
    });

    logger.info("Player deleted successfully", { playerId: player_id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Player delete error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      playerId: player_id,
    });
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 }
    );
  }
}

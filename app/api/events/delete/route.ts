import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function DELETE(request: Request) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "Brak eventId" }, { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event nie istnieje" },
        { status: 404 }
      );
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    });

    logger.info("Event deleted successfully", {
      eventId,
      matchId: event.matchId,
      playerName: event.playerName,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Delete event error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

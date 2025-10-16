import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { windowMinutes } = await request.json();

    const minutes = Number(windowMinutes || 3);
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });

    // Find last event within time window
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    const lastEvent = await prisma.event.findFirst({
      where: {
        matchId: settings?.activeMatch || "",
        timestamp: { gte: cutoffTime },
      },
      orderBy: { timestamp: "desc" },
    });

    if (!lastEvent) {
      return NextResponse.json({
        ok: false,
        reason: "Nie znaleziono zdarzenia w ostatnich minutach",
      });
    }

    await prisma.event.delete({ where: { id: lastEvent.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Undo error:", error);
    return NextResponse.json(
      {
        error: "Failed to undo event",
        ok: false,
        reason: "Brak zdarzeń",
      },
      { status: 500 }
    );
  }
}

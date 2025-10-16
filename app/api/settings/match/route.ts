import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();

    const settings = await prisma.settings.update({
      where: { id: 1 },
      data: { activeMatch: matchId || "" },
    });

    return NextResponse.json({
      ActiveMatch: settings.activeMatch,
      Quarter: settings.quarter,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to set match" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { quarter } = await request.json();
    logger.info("POST /api/settings/quarter - Changing quarter", { quarter });

    const settings = await prisma.settings.update({
      where: { id: 1 },
      data: { quarter: Number(quarter) },
    });

    logger.info("POST /api/settings/quarter - Quarter updated successfully", {
      newQuarter: settings.quarter,
      activeMatch: settings.activeMatch,
    });

    return NextResponse.json({
      ActiveMatch: settings.activeMatch,
      Quarter: settings.quarter,
    });
  } catch (error) {
    logger.error("POST /api/settings/quarter - Failed to set quarter", {
      error,
    });
    return NextResponse.json(
      { error: "Failed to set quarter" },
      { status: 500 }
    );
  }
}

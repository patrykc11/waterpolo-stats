import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    return NextResponse.json({
      ActiveMatch: settings?.activeMatch || "",
      Quarter: settings?.quarter || 1,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

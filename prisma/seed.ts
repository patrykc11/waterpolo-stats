import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create default settings if they don't exist
  const existingSettings = await prisma.settings.findUnique({
    where: { id: 1 },
  });

  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        id: 1,
        activeMatch: "",
        quarter: 1,
        editorPIN: "",
      },
    });
    console.log("✅ Created default settings");
  } else {
    console.log("✅ Settings already exist");
  }

  // Optionally create a sample match if none exist
  const matchCount = await prisma.match.count();
  if (matchCount === 0) {
    const sampleMatch = await prisma.match.create({
      data: {
        matchId: `match_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        opponent: "Przykładowy przeciwnik",
        place: "Hala sportowa",
        ageCategory: "Seniorzy",
        status: "active",
      },
    });

    // Set this match as active
    await prisma.settings.update({
      where: { id: 1 },
      data: { activeMatch: sampleMatch.matchId },
    });

    console.log("✅ Created sample match and set as active");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

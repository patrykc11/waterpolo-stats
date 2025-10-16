const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default settings
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      activeMatch: '',
      quarter: 1,
      editorPIN: '1234', // Default PIN - change this!
    },
  })
  console.log('✅ Settings created')

  // Create default editor user
  await prisma.user.upsert({
    where: { email: 'admin@waterpolo.pl' },
    update: {},
    create: {
      email: 'admin@waterpolo.pl',
      role: 'editor',
    },
  })
  console.log('✅ Admin user created')

  // Create sample players
  const players = [
    { playerId: 'p1', number: 1, name: 'Jan Kowalski', team: 'my' },
    { playerId: 'p2', number: 2, name: 'Piotr Nowak', team: 'my' },
    { playerId: 'p3', number: 3, name: 'Adam Wiśniewski', team: 'my' },
    { playerId: 'p4', number: 4, name: 'Marcin Lewandowski', team: 'my' },
    { playerId: 'p5', number: 5, name: 'Tomasz Kamiński', team: 'my' },
    { playerId: 'p6', number: 6, name: 'Michał Zieliński', team: 'my' },
    { playerId: 'p7', number: 7, name: 'Paweł Woźniak', team: 'my' },
    { playerId: 'p8', number: 8, name: 'Krzysztof Szymański', team: 'my' },
    { playerId: 'p9', number: 9, name: 'Robert Dąbrowski', team: 'my' },
    { playerId: 'p10', number: 10, name: 'Jakub Kozłowski', team: 'my' },
  ]

  for (const player of players) {
    await prisma.player.upsert({
      where: { playerId: player.playerId },
      update: {},
      create: player,
    })
  }
  console.log('✅ Sample players created')

  console.log('✅ Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


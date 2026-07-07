import { db } from '../src/client'
import bcrypt from 'bcryptjs'

const FIRST_NAMES = [
  'Jayden', 'Marcus', 'Elijah', 'Noah', 'Aiden', 'Cameron', 'Isaiah', 'Xavier', 'Malik', 'Tyler',
  'Josiah', 'Devon', 'Amir', 'Caleb', 'Jordan', 'Dominic', 'Nasir', 'Ezra', 'Miles', 'Zion',
]
const LAST_NAMES = [
  'Rios', 'Carter', 'Bennett', 'Diallo', 'Hughes', 'Ortiz', 'Bryant', 'Coleman', 'Nguyen', 'Foster',
  'Walsh', 'Reyes', 'Sutton', 'Grant', 'Mercer', 'Booker', 'Alston', 'Pierce', 'Lindsey', 'Franco',
]
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const
const CLASS_YEARS = ['2026', '2027', '2028']

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('Seeding...')

  const adminHash = await bcrypt.hash('password123', 12)
  const admin = await db.user.upsert({
    where: { email: 'admin@statman.dev' },
    update: {},
    create: {
      email: 'admin@statman.dev',
      passwordHash: adminHash,
      role: 'ADMIN',
      profile: { create: { username: 'admin', displayName: 'Statman Admin' } },
    },
  })
  console.log(`✓ Admin user: ${admin.email}`)

  const sport = await db.sport.upsert({
    where: { slug: 'basketball' },
    update: {},
    create: { slug: 'basketball', name: 'Basketball' },
  })

  const league = await db.league.upsert({
    where: { slug: 'demo-league' },
    update: {},
    create: { sportId: sport.id, slug: 'demo-league', name: 'Statman Demo League' },
  })

  const season = await db.season.upsert({
    where: { slug: '2025-26' },
    update: {},
    create: { leagueId: league.id, slug: '2025-26', name: '2025-26 Season', isActive: true },
  })

  const schools = await Promise.all([
    db.school.upsert({
      where: { slug: 'eastside-high' },
      update: {},
      create: { slug: 'eastside-high', name: 'Eastside High', city: 'Riverton', state: 'CA' },
    }),
    db.school.upsert({
      where: { slug: 'westview-high' },
      update: {},
      create: { slug: 'westview-high', name: 'Westview High', city: 'Riverton', state: 'CA' },
    }),
  ])

  const teams = await Promise.all([
    db.team.upsert({
      where: { slug: 'eastside-ballers' },
      update: {},
      create: {
        sportId: sport.id,
        leagueId: league.id,
        schoolId: schools[0].id,
        slug: 'eastside-ballers',
        name: 'Eastside Ballers',
        city: 'Riverton',
      },
    }),
    db.team.upsert({
      where: { slug: 'westview-hawks' },
      update: {},
      create: {
        sportId: sport.id,
        leagueId: league.id,
        schoolId: schools[1].id,
        slug: 'westview-hawks',
        name: 'Westview Hawks',
        city: 'Riverton',
      },
    }),
  ])
  console.log(`✓ Teams: ${teams.map((t) => t.name).join(', ')}`)

  let playerCount = 0
  for (let i = 0; i < 20; i++) {
    const team = teams[i % 2]
    const firstName = FIRST_NAMES[i]
    const lastName = LAST_NAMES[i]
    const slug = slugify(`${firstName}-${lastName}`)
    const jerseyNumber = Math.floor(i / 2) + 1

    const athleteProfile = await db.athleteProfile.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        firstName,
        lastName,
        hometown: 'Riverton, CA',
        sourceStatus: 'TEAM_ENTERED',
      },
    })

    const player = await db.player.upsert({
      where: { athleteProfileId_sportId: { athleteProfileId: athleteProfile.id, sportId: sport.id } },
      update: {},
      create: {
        athleteProfileId: athleteProfile.id,
        sportId: sport.id,
        position: POSITIONS[i % POSITIONS.length],
        classYear: CLASS_YEARS[i % CLASS_YEARS.length],
        jerseyNumber,
      },
    })

    await db.rosterMembership.upsert({
      where: { playerId_teamId_seasonId: { playerId: player.id, teamId: team.id, seasonId: season.id } },
      update: {},
      create: { playerId: player.id, teamId: team.id, seasonId: season.id, jerseyNumber },
    })

    playerCount++
  }
  console.log(`✓ Players seeded: ${playerCount} (10 per team)`)

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())

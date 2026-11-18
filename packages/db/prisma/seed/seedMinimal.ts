import { db } from '../../src/client'
import type { SeedConfig } from './config'
import { DEVELOPMENT_PASSWORD, existingOrNewPasswordHash } from './helpers'
import { seedIds } from './ids'

export async function seedMinimal(config: SeedConfig) {
  const existingAdmin = await db.user.findUnique({ where: { email: seedIds.users.admin.email }, select: { passwordHash: true } })
  const passwordHash = await existingOrNewPasswordHash(existingAdmin?.passwordHash)

  for (const user of [seedIds.users.admin, seedIds.users.fan]) {
    const isAdmin = user.email === seedIds.users.admin.email
    const displayName = isAdmin ? 'Statman Admin' : 'Sam the Superfan'
    await db.user.upsert({
      where: { email: user.email },
      update: {
        role: isAdmin ? 'ADMIN' : 'USER',
        profile: { upsert: { update: { username: user.username, displayName }, create: { username: user.username, displayName } } },
      },
      create: {
        id: user.id, email: user.email, passwordHash, role: isAdmin ? 'ADMIN' : 'USER',
        profile: { create: { id: `${user.id}-profile`, username: user.username, displayName } },
      },
    })
  }

  const sport = await db.sport.upsert({
    where: { slug: 'basketball' },
    update: { name: 'Basketball' },
    create: { id: seedIds.sport.basketball, slug: 'basketball', name: 'Basketball' },
  })
  const league = await db.league.upsert({
    where: { slug: 'demo-league' },
    update: { sportId: sport.id, name: 'Statman Demo League' },
    create: { id: seedIds.league.basketball, sportId: sport.id, slug: 'demo-league', name: 'Statman Demo League' },
  })
  await db.season.upsert({
    where: { slug: '2025-26' },
    update: { leagueId: league.id, name: '2025-26 Season', isActive: true },
    create: { id: seedIds.seasons.current, leagueId: league.id, slug: '2025-26', name: '2025-26 Season', isActive: true, startDate: config.referenceDate },
  })

  for (const team of [
    { id: seedIds.teams.comets, slug: 'eastside-ballers', name: 'Eastside Ballers', logo: 'https://placehold.co/256x256/1d4ed8/ffffff?text=EB' },
    { id: seedIds.teams.falcons, slug: 'westview-hawks', name: 'Westview Hawks', logo: 'https://placehold.co/256x256/b91c1c/ffffff?text=WH' },
  ]) {
    await db.team.upsert({
      where: { slug: team.slug },
      update: { sportId: sport.id, leagueId: league.id, name: team.name, city: 'Riverton', logoUrl: team.logo },
      create: { id: team.id, sportId: sport.id, leagueId: league.id, slug: team.slug, name: team.name, city: 'Riverton', logoUrl: team.logo },
    })
  }

  console.log(`✓ Minimal core: 1 sport, 1 league, 1 season, 2 teams, 2 users (password: ${DEVELOPMENT_PASSWORD})`)
}

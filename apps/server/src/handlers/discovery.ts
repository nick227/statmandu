import { db } from '@statman/db'
import { buildShareMetadata } from '../lib/shareMetadata'

// We re-use serializers if possible, or build minimal ones
function serializePlayerSummary(player: any) {
  const { rosterMemberships, athleteProfile, ...rest } = player
  return {
    id: player.id,
    sportId: player.sportId,
    position: player.position,
    classYear: player.classYear,
    athleteProfile: athleteProfile ? {
      id: athleteProfile.id,
      slug: athleteProfile.slug,
      firstName: athleteProfile.firstName,
      lastName: athleteProfile.lastName,
      avatarUrl: athleteProfile.avatarUrl,
      sourceStatus: athleteProfile.sourceStatus,
    } : null,
    currentTeam: rosterMemberships?.[0]?.team ? {
      id: rosterMemberships[0].team.id,
      slug: rosterMemberships[0].team.slug,
      name: rosterMemberships[0].team.name,
      logoUrl: rosterMemberships[0].team.logoUrl,
    } : null,
  }
}

function serializeGameSummary(game: any) {
  return {
    id: game.id,
    scheduledAt: game.scheduledAt,
    status: game.status,
    gameTeams: game.gameTeams?.map((gt: any) => ({
      isHome: gt.isHome,
      finalScore: gt.finalScore,
      team: gt.team ? {
        id: gt.team.id,
        slug: gt.team.slug,
        name: gt.team.name,
        logoUrl: gt.team.logoUrl,
      } : null
    })) || []
  }
}

export async function getHomeDiscovery(request: any, reply: any) {
  // 1. Hero item: could be the latest big game or a featured card
  const latestFinalGame = await db.game.findFirst({
    where: { status: 'FINAL' },
    orderBy: { scheduledAt: 'desc' },
    include: {
      gameTeams: { include: { team: true } }
    }
  })

  let heroItem = null
  if (latestFinalGame) {
    const teams = latestFinalGame.gameTeams.map(gt => gt.team.name).join(' vs ')
    heroItem = {
      id: latestFinalGame.id,
      type: 'GAME',
      title: 'Recent Result',
      subtitle: teams,
      imageUrl: latestFinalGame.gameTeams[0]?.team?.logoUrl || '',
      actionUrl: `/games/${latestFinalGame.id}`
    }
  }

  // 2. Trending athletes (athletes with recent reactions or follows)
  // We'll use recent players with profiles for simplicity
  const trendingPlayers = await db.player.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      athleteProfile: true,
      rosterMemberships: { where: { isActive: true }, include: { team: true } }
    }
  })

  // 3. Recent big games
  const recentGames = await db.game.findMany({
    where: { status: 'FINAL' },
    take: 5,
    orderBy: { scheduledAt: 'desc' },
    include: {
      gameTeams: { include: { team: true } }
    }
  })

  // 4. New cards
  const newCards = await db.cardRelease.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      team: true,
      athleteProfile: true,
      frontImageAsset: true,
    }
  })

  const response = {
    heroItem,
    trendingAthletes: trendingPlayers.map(serializePlayerSummary),
    recentBigGames: recentGames.map(serializeGameSummary),
    newCards: newCards.map(c => ({
      id: c.id,
      title: c.title,
      frontImageUrl: c.frontImageAsset?.url ?? null,
    })),
    leaderboardTeaser: trendingPlayers.slice(0,3).map((p, i) => ({
      rank: i + 1,
      player: serializePlayerSummary(p),
      score: `${100 - i * 10} pts`
    }))
  }

  return reply.send({ data: response })
}

export async function getExploreDiscovery(request: any, reply: any) {
  const limit = request.query.limit || 20
  
  // Just return athletes and teams for MVP explore
  const athletes = await db.player.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      athleteProfile: true,
      rosterMemberships: { where: { isActive: true }, include: { team: true } }
    }
  })

  const teams = await db.team.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' }
  })

  const response = {
    athletes: athletes.map(serializePlayerSummary),
    teams: teams.map(t => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      logoUrl: t.logoUrl,
    })),
    games: [],
    cards: [],
    nextCursor: null
  }

  return reply.send({ data: response })
}

import { EntityType } from '@statman/db'

export function buildShareMetadata(
  type: 'person' | 'player' | 'team' | 'game' | 'card',
  id: string,
  data: any
) {
  const baseUrl = process.env.FRONTEND_URL || 'https://statman.app'
  
  if (type === 'person') return { canonicalUrl: `${baseUrl}/people/${id}`, shareTitle: data.displayName, shareText: `Discover ${data.displayName}`, imageUrl: data.avatarUrl ?? null }

  if (type === 'player') {
    const name = `${data.athleteProfile?.firstName || ''} ${data.athleteProfile?.lastName || ''}`.trim()
    return {
      canonicalUrl: `${baseUrl}/athletes/${data.athleteProfile?.slug || id}`,
      shareTitle: name,
      shareText: `Check out ${name}'s profile on Statman`,
      imageUrl: data.athleteProfile?.avatarUrl || null,
    }
  }

  if (type === 'team') {
    return {
      canonicalUrl: `${baseUrl}/teams/${data.slug || id}`,
      shareTitle: data.name,
      shareText: `Check out the ${data.name} on Statman`,
      imageUrl: data.logoUrl || null,
    }
  }

  if (type === 'game') {
    const title = data.gameTeams ? data.gameTeams.map((gt: any) => gt.team?.name).join(' vs ') : 'Game'
    return {
      canonicalUrl: `${baseUrl}/games/${id}`,
      shareTitle: title,
      shareText: `Follow the ${title} game live on Statman`,
      imageUrl: null,
    }
  }

  if (type === 'card') {
    return {
      canonicalUrl: `${baseUrl}/cards/${id}`,
      shareTitle: data.title || 'Statman Card',
      shareText: `Check out this digital card on Statman`,
      imageUrl: data.frontImageUrl || null,
    }
  }

  return {
    canonicalUrl: baseUrl,
    shareTitle: 'Statman',
    shareText: 'Check out Statman',
    imageUrl: null
  }
}

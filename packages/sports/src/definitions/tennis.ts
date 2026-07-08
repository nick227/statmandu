import type { SportDefinition } from '../core/types'

export const tennisDefinition: SportDefinition = {
  slug: 'tennis',
  name: 'Tennis',
  leagueTypes: ['school', 'club', 'ladder', 'tournament'],
  positions: ['SINGLES', 'DOUBLES'],
  periods: { type: 'sets' },
  score: { unit: 'matches', highScoreWins: true },
  theme: { accent: { light: '132 204 22', dark: '163 230 53' } },
  events: {
    TENNIS_MATCH_WIN: { label: 'Match win', shortLabel: 'MATCH W', group: 'Result', points: 1, requiresPlayer: true, requiresTeam: true, confirmationMode: 'confirm', statDeltas: { matchWins: 1 } },
    TENNIS_MATCH_LOSS: { label: 'Match loss', shortLabel: 'MATCH L', group: 'Result', requiresPlayer: true, requiresTeam: true, confirmationMode: 'confirm', statDeltas: { matchLosses: 1 } },
    TENNIS_SET_WIN: { label: 'Set win', shortLabel: 'SET W', group: 'Set', requiresPlayer: true, requiresTeam: true, statDeltas: { setsWon: 1 } },
    TENNIS_SET_LOSS: { label: 'Set loss', shortLabel: 'SET L', group: 'Set', requiresPlayer: true, requiresTeam: true, statDeltas: { setsLost: 1 } },
    TENNIS_ACE: { label: 'Ace', shortLabel: 'ACE', group: 'Serving', requiresPlayer: true, requiresTeam: true, statDeltas: { aces: 1 } },
    TENNIS_DOUBLE_FAULT: { label: 'Double fault', shortLabel: 'DF', group: 'Serving', requiresPlayer: true, requiresTeam: true, statDeltas: { doubleFaults: 1 } },
  },
  playerStatFields: {
    matchWins: { label: 'MW', type: 'integer', aggregate: 'sum' },
    gamesPlayed: { label: 'GP', type: 'integer', aggregate: 'sum' },
    matchLosses: { label: 'ML', type: 'integer', aggregate: 'sum' },
    setsWon: { label: 'SW', type: 'integer', aggregate: 'sum' },
    setsLost: { label: 'SL', type: 'integer', aggregate: 'sum' },
    aces: { label: 'ACE', type: 'integer', aggregate: 'sum' },
    doubleFaults: { label: 'DF', type: 'integer', aggregate: 'sum' },
  },
  teamStatFields: {
    wins: { label: 'W', type: 'integer', aggregate: 'sum' },
    losses: { label: 'L', type: 'integer', aggregate: 'sum' },
    pointsFor: { label: 'PF', type: 'integer', aggregate: 'sum' },
    pointsAgainst: { label: 'PA', type: 'integer', aggregate: 'sum' },
    matchesWon: { label: 'MW', type: 'integer', aggregate: 'sum' },
    matchesLost: { label: 'ML', type: 'integer', aggregate: 'sum' },
  },
  views: {
    profileHeadline: ['matchWins', 'setsWon', 'aces', 'gamesPlayed'],
    teamProfileHeadline: ['wins', 'losses', 'pointsFor', 'pointsAgainst'],
    boxScore: ['matchWins', 'matchLosses', 'setsWon', 'setsLost', 'aces', 'doubleFaults'],
    leaderboard: ['matchWins', 'setsWon', 'aces'],
    livePad: [
      ['TENNIS_MATCH_WIN', 'TENNIS_MATCH_LOSS'],
      ['TENNIS_SET_WIN', 'TENNIS_SET_LOSS'],
      ['TENNIS_ACE', 'TENNIS_DOUBLE_FAULT'],
    ],
  },
}

import type { SportDefinition } from '../core/types'

export const soccerDefinition: SportDefinition = {
  slug: 'soccer',
  name: 'Soccer',
  leagueTypes: ['school', 'club', 'academy', 'recreational', 'tournament'],
  positions: ['GK', 'DEF', 'MID', 'FWD'],
  periods: { type: 'halves', count: 2 },
  score: { unit: 'goals', highScoreWins: true },
  theme: { accent: { light: '13 148 136', dark: '45 212 191' } },
  events: {
    SOCCER_GOAL: { label: 'Goal', shortLabel: 'GOAL', group: 'Scoring', points: 1, requiresPlayer: true, requiresTeam: true, quickAdjust: true, statDeltas: { goals: 1 } },
    SOCCER_ASSIST: { label: 'Assist', shortLabel: 'AST', group: 'Scoring', requiresPlayer: true, requiresTeam: true, statDeltas: { assists: 1 } },
    SOCCER_SHOT: { label: 'Shot', shortLabel: 'SHOT', group: 'Attack', requiresPlayer: true, requiresTeam: true, statDeltas: { shots: 1 } },
    SOCCER_SAVE: { label: 'Save', shortLabel: 'SAVE', group: 'Goalkeeping', requiresPlayer: true, requiresTeam: true, statDeltas: { saves: 1 } },
    SOCCER_YELLOW_CARD: { label: 'Yellow card', shortLabel: 'YC', group: 'Discipline', requiresPlayer: true, requiresTeam: true, confirmationMode: 'confirm', statDeltas: { yellowCards: 1 } },
    SOCCER_RED_CARD: { label: 'Red card', shortLabel: 'RC', group: 'Discipline', requiresPlayer: true, requiresTeam: true, confirmationMode: 'confirm', statDeltas: { redCards: 1 } },
  },
  playerStatFields: {
    goals: { label: 'G', type: 'integer', aggregate: 'sum' },
    gamesPlayed: { label: 'GP', type: 'integer', aggregate: 'sum' },
    assists: { label: 'A', type: 'integer', aggregate: 'sum' },
    shots: { label: 'SH', type: 'integer', aggregate: 'sum' },
    saves: { label: 'SV', type: 'integer', aggregate: 'sum' },
    yellowCards: { label: 'YC', type: 'integer', aggregate: 'sum' },
    redCards: { label: 'RC', type: 'integer', aggregate: 'sum' },
  },
  teamStatFields: {
    wins: { label: 'W', type: 'integer', aggregate: 'sum' },
    losses: { label: 'L', type: 'integer', aggregate: 'sum' },
    draws: { label: 'D', type: 'integer', aggregate: 'sum' },
    pointsFor: { label: 'GF', type: 'integer', aggregate: 'sum' },
    pointsAgainst: { label: 'GA', type: 'integer', aggregate: 'sum' },
    goalsFor: { label: 'GF', type: 'integer', aggregate: 'sum' },
    goalsAgainst: { label: 'GA', type: 'integer', aggregate: 'sum' },
  },
  views: {
    profileHeadline: ['goals', 'assists', 'shots', 'gamesPlayed'],
    teamProfileHeadline: ['wins', 'losses', 'pointsFor', 'pointsAgainst'],
    boxScore: ['goals', 'assists', 'shots', 'saves', 'yellowCards', 'redCards'],
    leaderboard: ['goals', 'assists', 'saves'],
    livePad: [
      ['SOCCER_GOAL', 'SOCCER_ASSIST', 'SOCCER_SHOT'],
      ['SOCCER_SAVE', 'SOCCER_YELLOW_CARD', 'SOCCER_RED_CARD'],
    ],
  },
}

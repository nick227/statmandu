import type { SportDefinition } from '../core/types'

export const footballDefinition: SportDefinition = {
  slug: 'football',
  name: 'Football',
  leagueTypes: ['school', 'club', 'recreational', 'tournament'],
  positions: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
  periods: { type: 'quarters', count: 4 },
  score: { unit: 'points', highScoreWins: true },
  theme: { accent: { light: '180 83 9', dark: '217 119 6' } },
  events: {
    FOOTBALL_PASS_TD: { label: 'Passing touchdown', shortLabel: 'PASS TD', group: 'Scoring', points: 6, requiresPlayer: true, requiresTeam: true, confirmationMode: 'detail', statDeltas: { passingTouchdowns: 1, pointsResponsibleFor: 6 } },
    FOOTBALL_RUSH_TD: { label: 'Rushing touchdown', shortLabel: 'RUSH TD', group: 'Scoring', points: 6, requiresPlayer: true, requiresTeam: true, confirmationMode: 'detail', statDeltas: { rushingTouchdowns: 1, points: 6 } },
    FOOTBALL_REC_TD: { label: 'Receiving touchdown', shortLabel: 'REC TD', group: 'Scoring', points: 6, requiresPlayer: true, requiresTeam: true, confirmationMode: 'detail', statDeltas: { receivingTouchdowns: 1, points: 6 } },
    FOOTBALL_FIELD_GOAL_MADE: { label: 'Field goal made', shortLabel: 'FG +3', group: 'Scoring', points: 3, requiresPlayer: true, requiresTeam: true, statDeltas: { fieldGoalsMade: 1, points: 3 } },
    FOOTBALL_EXTRA_POINT_MADE: { label: 'Extra point made', shortLabel: 'XP +1', group: 'Scoring', points: 1, requiresPlayer: true, requiresTeam: true, statDeltas: { extraPointsMade: 1, points: 1 } },
    FOOTBALL_SACK: { label: 'Sack', shortLabel: 'SACK', group: 'Defense', requiresPlayer: true, requiresTeam: true, statDeltas: { sacks: 1 } },
    FOOTBALL_INTERCEPTION: { label: 'Interception', shortLabel: 'INT', group: 'Defense', requiresPlayer: true, requiresTeam: true, statDeltas: { interceptions: 1 } },
  },
  playerStatFields: {
    points: { label: 'PTS', type: 'integer', aggregate: 'sum' },
    gamesPlayed: { label: 'GP', type: 'integer', aggregate: 'sum' },
    pointsResponsibleFor: { label: 'PRF', type: 'integer', aggregate: 'sum' },
    passingTouchdowns: { label: 'PaTD', type: 'integer', aggregate: 'sum' },
    rushingTouchdowns: { label: 'RuTD', type: 'integer', aggregate: 'sum' },
    receivingTouchdowns: { label: 'RecTD', type: 'integer', aggregate: 'sum' },
    fieldGoalsMade: { label: 'FGM', type: 'integer', aggregate: 'sum' },
    extraPointsMade: { label: 'XPM', type: 'integer', aggregate: 'sum' },
    sacks: { label: 'SACK', type: 'integer', aggregate: 'sum' },
    interceptions: { label: 'INT', type: 'integer', aggregate: 'sum' },
  },
  teamStatFields: {
    wins: { label: 'W', type: 'integer', aggregate: 'sum' },
    losses: { label: 'L', type: 'integer', aggregate: 'sum' },
    pointsFor: { label: 'PF', type: 'integer', aggregate: 'sum' },
    pointsAgainst: { label: 'PA', type: 'integer', aggregate: 'sum' },
  },
  views: {
    profileHeadline: ['points', 'passingTouchdowns', 'rushingTouchdowns', 'gamesPlayed'],
    teamProfileHeadline: ['wins', 'losses', 'pointsFor', 'pointsAgainst'],
    boxScore: ['points', 'passingTouchdowns', 'rushingTouchdowns', 'receivingTouchdowns', 'sacks', 'interceptions'],
    leaderboard: ['points', 'passingTouchdowns', 'rushingTouchdowns', 'sacks'],
    livePad: [
      ['FOOTBALL_PASS_TD', 'FOOTBALL_RUSH_TD', 'FOOTBALL_REC_TD'],
      ['FOOTBALL_FIELD_GOAL_MADE', 'FOOTBALL_EXTRA_POINT_MADE'],
      ['FOOTBALL_SACK', 'FOOTBALL_INTERCEPTION'],
    ],
  },
}

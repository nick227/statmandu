export const VIDEOS_SCREEN = {
  title: 'Film',
  error: 'Videos could not be loaded.',
} as const

export const VIDEOS_COPY = {
  browse: {
    title: 'Swipe the wire',
    subtitle: 'Vertical browse through the latest athlete, team, and game film.',
  },
  empty: {
    title: 'No film yet',
    description: 'When athletes, teams, and fans upload highlights, they will show up here first.',
  },
  actions: {
    open: 'Open film',
    swipeHint: 'Swipe up for the next clip',
  },
} as const

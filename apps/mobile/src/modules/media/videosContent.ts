export const VIDEOS_SCREEN = {
  title: 'Film',
  error: 'Videos could not be loaded.',
} as const

export const VIDEOS_COPY = {
  browse: {
    title: 'Film',
    subtitle: 'Swipe up for the next clip. Active clips play inline.',
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

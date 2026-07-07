// YouTube is the only media source for MVP (see 11_TECHNICAL_SPECIFICATIONS_SHEET.md
// "no direct hosting in MVP") — this is the one place that knows how to turn a
// stored videoId into a displayable thumbnail or embed URL.
export function youtubeThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

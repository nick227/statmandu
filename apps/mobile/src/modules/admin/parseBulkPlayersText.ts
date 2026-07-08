export function parseBulkPlayersText(text: string) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return lines.map((line) => {
    const [firstName, lastName, sportSlug] = line.split(',').map((p) => p.trim())
    if (!firstName || !lastName || !sportSlug) {
      throw new Error('Each line must be: firstName,lastName,sportSlug')
    }
    return { firstName, lastName, sportSlug }
  })
}


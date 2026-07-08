let actAsUserId: string | null = null
let nextAdminNote: string | null = null
const listeners = new Set<() => void>()

export function getActAsUserId() {
  return actAsUserId
}

export function setActAsUserId(userId: string | null) {
  actAsUserId = userId
  for (const l of listeners) l()
}

export function subscribeActAsUserId(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function consumeNextAdminNote() {
  const note = nextAdminNote
  nextAdminNote = null
  return note
}

export function setNextAdminNote(note: string | null) {
  nextAdminNote = note
}


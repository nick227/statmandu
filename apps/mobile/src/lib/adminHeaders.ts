let actAsUserId: string | null = null
let nextAdminNote: string | null = null

export function getActAsUserId() {
  return actAsUserId
}

export function setActAsUserId(userId: string | null) {
  actAsUserId = userId
}

export function consumeNextAdminNote() {
  const note = nextAdminNote
  nextAdminNote = null
  return note
}

export function setNextAdminNote(note: string | null) {
  nextAdminNote = note
}


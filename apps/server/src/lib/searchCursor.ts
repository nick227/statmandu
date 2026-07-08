// Search results are relevance-ordered, not created-at-ordered, so the
// cursor is a plain offset into that ordering rather than the
// {createdAt, id} shape `lib/pagination.ts` uses for entity lists.
export function encodeOffsetCursor(offset: number) {
  return Buffer.from(String(offset)).toString('base64url')
}

export function decodeOffsetCursor(cursor?: string): number {
  if (!cursor) return 0
  const offset = Number(Buffer.from(cursor, 'base64url').toString('utf8'))
  if (!Number.isInteger(offset) || offset < 0) throw { statusCode: 400, message: 'Invalid cursor' }
  return offset
}

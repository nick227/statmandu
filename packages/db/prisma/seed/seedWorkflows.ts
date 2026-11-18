import { db } from '../../src/client'
import { SeedClock } from './helpers'

export async function seedVerificationAndAdmin(referenceDate: Date) {
  const clock = new SeedClock(referenceDate)
  const admin = await db.user.findUniqueOrThrow({ where: { email: 'admin@statman.dev' } })
  const athleteUser = await db.user.findUniqueOrThrow({ where: { email: 'athlete@statman.dev' } })
  const fan = await db.user.findUniqueOrThrow({ where: { email: 'fan1@statman.dev' } })
  const verifier = await db.user.findUniqueOrThrow({ where: { email: 'fan2@statman.dev' } })
  const athletes = await db.athleteProfile.findMany({ orderBy: { slug: 'asc' }, take: 5 })
  if (athletes.length < 5) throw new Error('Verification scenario requires demo athletes')

  await db.claim.upsert({
    where: { id: 'seed-claim-approved' },
    update: { athleteProfileId: athletes.find((athlete) => athlete.claimedByUserId === athleteUser.id)?.id ?? athletes[0]!.id, requestedByUserId: athleteUser.id, status: 'APPROVED', reviewedByUserId: admin.id, reviewedAt: clock.days(-12) },
    create: { id: 'seed-claim-approved', athleteProfileId: athletes.find((athlete) => athlete.claimedByUserId === athleteUser.id)?.id ?? athletes[0]!.id, requestedByUserId: athleteUser.id, verificationNote: 'Development-only approved identity fixture.', status: 'APPROVED', reviewedByUserId: admin.id, reviewedAt: clock.days(-12) },
  })
  await db.claim.upsert({
    where: { id: 'seed-claim-rejected' },
    update: { athleteProfileId: athletes[3]!.id, requestedByUserId: verifier.id, status: 'REJECTED', reviewedByUserId: admin.id, reviewedAt: clock.days(-7) },
    create: { id: 'seed-claim-rejected', athleteProfileId: athletes[3]!.id, requestedByUserId: verifier.id, verificationNote: 'Evidence did not match the roster record.', status: 'REJECTED', reviewedByUserId: admin.id, reviewedAt: clock.days(-7) },
  })

  await db.dispute.upsert({
    where: { id: 'seed-dispute-resolved-profile' },
    update: { targetType: 'ATHLETE_PROFILE', targetId: athletes[2]!.id, fieldName: 'hometown', submittedByUserId: fan.id, status: 'RESOLVED', resolutionNote: 'Confirmed against the team roster.', resolvedByUserId: admin.id, resolvedAt: clock.days(-4) },
    create: { id: 'seed-dispute-resolved-profile', targetType: 'ATHLETE_PROFILE', targetId: athletes[2]!.id, fieldName: 'hometown', submittedByUserId: fan.id, description: 'The listed hometown differs from the current team roster.', proposedValue: 'Riverton, CA', status: 'RESOLVED', resolutionNote: 'Confirmed against the team roster.', resolvedByUserId: admin.id, resolvedAt: clock.days(-4) },
  })

  const liveGame = await db.game.findUniqueOrThrow({ where: { id: 'seed-live-game' } })
  const reporters = await db.gameReporter.findMany({ where: { gameId: liveGame.id }, orderBy: { role: 'asc' }, take: 2 })
  const players = await db.player.findMany({ where: { rosterMemberships: { some: { season: { slug: '2025-26' }, isActive: true } } }, take: 3 })
  if (reporters.length >= 2 && players.length >= 2) {
    const resolvedEventId = 'seed-live-event-resolved'
    await db.gameConsensusGroup.upsert({
      where: { id: 'seed-live-consensus-resolved' },
      update: { gameId: liveGame.id, groupKey: 'period-2-08:41-shot', status: 'RESOLVED', resolvedEventId },
      create: { id: 'seed-live-consensus-resolved', gameId: liveGame.id, groupKey: 'period-2-08:41-shot', status: 'RESOLVED', resolvedEventId },
    })
    await db.gameEvent.upsert({
      where: { id: resolvedEventId },
      update: { reporterId: reporters[0]!.id, playerId: players[0]!.id, type: 'FG2_MADE', payload: { period: 2, correctedFrom: 'FG3_MADE' }, status: 'CORRECTED', consensusGroupId: 'seed-live-consensus-resolved' },
      create: { id: resolvedEventId, gameId: liveGame.id, reporterId: reporters[0]!.id, playerId: players[0]!.id, type: 'FG2_MADE', payload: { period: 2, correctedFrom: 'FG3_MADE' }, clientTimestamp: clock.minutes(-14), status: 'CORRECTED', consensusGroupId: 'seed-live-consensus-resolved' },
    })
    await db.gameEvent.upsert({
      where: { id: 'seed-live-event-rejected' },
      update: { reporterId: reporters[1]!.id, playerId: players[0]!.id, type: 'FG3_MADE', payload: { period: 2 }, status: 'REJECTED', consensusGroupId: 'seed-live-consensus-resolved' },
      create: { id: 'seed-live-event-rejected', gameId: liveGame.id, reporterId: reporters[1]!.id, playerId: players[0]!.id, type: 'FG3_MADE', payload: { period: 2 }, clientTimestamp: clock.minutes(-14), status: 'REJECTED', consensusGroupId: 'seed-live-consensus-resolved' },
    })
    const extraEvents = [
      { id: 'seed-live-event-foul', type: 'FOUL' as const, playerId: players[1]!.id, minute: -10 },
      { id: 'seed-live-event-turnover', type: 'TURNOVER' as const, playerId: players[1]!.id, minute: -9 },
      { id: 'seed-live-event-sub-out', type: 'SUBSTITUTION_OUT' as const, playerId: players[1]!.id, minute: -8 },
      { id: 'seed-live-event-sub-in', type: 'SUBSTITUTION_IN' as const, playerId: players[2]!.id, minute: -8 },
    ]
    for (const event of extraEvents) {
      await db.gameEvent.upsert({
        where: { id: event.id },
        update: { reporterId: reporters[0]!.id, playerId: event.playerId, type: event.type, payload: { period: 2 }, status: 'ACCEPTED' },
        create: { id: event.id, gameId: liveGame.id, reporterId: reporters[0]!.id, playerId: event.playerId, type: event.type, payload: { period: 2 }, clientTimestamp: clock.minutes(event.minute), status: 'ACCEPTED' },
      })
    }
  }

  await db.importRun.upsert({
    where: { id: 'seed-import-run-review' },
    update: { status: 'READY', scopes: ['teams', 'players', 'games'], capabilities: { boxScores: true }, estimatedRequestCost: 8 },
    create: { id: 'seed-import-run-review', provider: 'API_SPORTS_BASKETBALL', status: 'READY', requestedById: admin.id, leagueExternalId: 'seed-league-100', seasonExternalId: 'seed-season-2026', scopes: ['teams', 'players', 'games'], options: { dryRun: true }, capabilities: { boxScores: true }, estimatedRequestCost: 8 },
  })
  await db.importRecord.upsert({
    where: { importRunId_entityType_externalId: { importRunId: 'seed-import-run-review', entityType: 'TEAM', externalId: 'seed-team-review-1' } },
    update: { externalName: 'Riverton Falcons', action: 'CONFLICT', normalized: { name: 'Riverton Falcons' }, differences: { name: ['Westview Hawks', 'Riverton Falcons'] } },
    create: { id: 'seed-import-record-conflict', importRunId: 'seed-import-run-review', entityType: 'TEAM', externalId: 'seed-team-review-1', externalName: 'Riverton Falcons', action: 'CONFLICT', normalized: { name: 'Riverton Falcons' }, differences: { name: ['Westview Hawks', 'Riverton Falcons'] } },
  })
  await db.adminAuditLog.upsert({
    where: { id: 'seed-admin-audit-review' },
    update: { actorUserId: admin.id, action: 'ADMIN_MUTATION', method: 'PATCH', path: '/admin/claims/seed-claim-approved', targetType: 'ATHLETE_PROFILE', targetId: athletes[0]!.id, note: 'Development seed audit fixture.' },
    create: { id: 'seed-admin-audit-review', actorUserId: admin.id, action: 'ADMIN_MUTATION', method: 'PATCH', path: '/admin/claims/seed-claim-approved', targetType: 'ATHLETE_PROFILE', targetId: athletes[0]!.id, note: 'Development seed audit fixture.', requestId: 'seed-request-admin-review', createdAt: clock.days(-12) },
  })

  console.log('✓ Verification/admin: pending, approved, and rejected claims; open/resolved disputes; import conflict; live correction')
}

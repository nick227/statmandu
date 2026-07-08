import { AdminService } from '../services/AdminService'

const adminService = new AdminService()

export async function getAdminMetrics(_request: any, reply: any) {
  const metrics = await adminService.metrics()
  return reply.send({ data: metrics })
}

export async function bulkCreatePlayers(request: any, reply: any) {
  const items = request.body?.items
  if (!Array.isArray(items) || items.length === 0) throw { statusCode: 400, message: 'items is required' }
  const result = await adminService.bulkCreatePlayers(request.user.id, items)
  return reply.send({ data: result })
}

export async function bulkAddRosterMembers(request: any, reply: any) {
  const items = request.body?.items
  if (!Array.isArray(items) || items.length === 0) throw { statusCode: 400, message: 'items is required' }
  const result = await adminService.bulkAddRosterMembers(request.params.teamId, items)
  return reply.send({ data: result })
}

export async function adminListDisputes(request: any, reply: any) {
  const disputes = await adminService.listDisputes({
    status: request.query?.status,
    targetType: request.query?.targetType,
    targetId: request.query?.targetId,
  })
  return reply.send({ data: disputes })
}

export async function adminCreateFeedItem(request: any, reply: any) {
  const feedItem = await adminService.createFeedItem(request.body)
  return reply.status(201).send({ data: feedItem })
}

export async function adminListAuditLog(request: any, reply: any) {
  const result = await adminService.listAuditLog(request.query ?? {})
  return reply.send(result)
}


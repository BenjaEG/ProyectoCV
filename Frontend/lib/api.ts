import type {
  Comment,
  Event,
  NewsItem,
  Ticket,
  TicketCategory,
  TicketCategoryOption,
  TicketSummary,
  User,
  UserRole,
} from '@/lib/types'

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8081'
const SERVER_API_BASE_URL = process.env.API_SERVER_BASE_URL ?? PUBLIC_API_BASE_URL

function getApiBaseUrl(): string {
  return typeof window === 'undefined' ? SERVER_API_BASE_URL : PUBLIC_API_BASE_URL
}

export type TicketQueryFilters = {
  q?: string
  status?: Ticket['status']
  categoryId?: number
}

type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

type BackendTicketListItem = {
  id: number
  ticketCode: string
  title: string
  location: string
  status: 'OPEN' | 'IN_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdByUsername: string
  assignedOperatorId?: string | null
  assignedOperatorUsername?: string | null
  categoryId?: number | null
  categoryName?: string | null
  createdAt: string
  updatedAt?: string | null
}

type BackendTicketDetail = BackendTicketListItem & {
  description: string
  createdByUserId: string
  createdByEmail?: string | null
  comments?: BackendComment[]
  attachments?: Array<{ filePath: string }>
}

type BackendComment = {
  id: number
  content: string
  authorId: string
  authorUsername?: string | null
  createdAt: string
}

type BackendCategory = {
  id: number
  name: string
}

type BackendTicketSummary = {
  total: number
  open: number
  inReview: number
  inProgress: number
  resolved: number
  closed: number
}

type BackendNewsItem = {
  id: number
  title: string
  copete: string
  content: string
  imageUrl?: string | null
  published: boolean
  createdAt: string
  updatedAt?: string | null
}

type BackendEvent = {
  id: number
  title: string
  copete: string
  description: string
  eventDate: string
  eventTime: string
  location: string
  imageUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type BackendAdminUser = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  emailVerified: boolean
  createdTimestamp?: number | null
  roles: string[]
}

type BackendAdminRole = {
  name: string
  description?: string | null
}

type RequestOptions = {
  method?: string
  token?: string
  body?: unknown
}

export type FrontendPageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

const STATUS_TO_BACKEND: Record<Ticket['status'], BackendTicketListItem['status']> = {
  open: 'OPEN',
  in_review: 'IN_REVIEW',
  in_progress: 'IN_PROGRESS',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
}

function normalizeCategory(name?: string | null): TicketCategory {
  const normalized = (name ?? '').trim().toLowerCase()

  if (normalized.includes('lumin') || normalized.includes('ilumin') || normalized.includes('farol')) {
    return 'lighting'
  }
  if (normalized.includes('basura') || normalized.includes('limpieza')) {
    return 'garbage'
  }
  if (normalized.includes('calle') || normalized.includes('bache') || normalized.includes('vereda')) {
    return 'streets'
  }
  if (normalized.includes('seguridad') || normalized.includes('robo')) {
    return 'security'
  }

  return 'other'
}

function mapStatus(status: BackendTicketListItem['status']): Ticket['status'] {
  switch (status) {
    case 'OPEN':
      return 'open'
    case 'IN_REVIEW':
      return 'in_review'
    case 'IN_PROGRESS':
      return 'in_progress'
    case 'RESOLVED':
      return 'resolved'
    case 'CLOSED':
      return 'closed'
  }
}

function mapUserRole(roleNames: string[]): UserRole {
  if (roleNames.includes('ROLE_ADMIN')) {
    return 'admin'
  }
  if (roleNames.includes('ROLE_OPERADOR')) {
    return 'staff'
  }
  return 'neighbor'
}

export function mapRoleNamesToUserRole(roleNames: string[]): UserRole {
  return mapUserRole(roleNames)
}

function mapTicket(ticket: BackendTicketListItem | BackendTicketDetail): Ticket {
  return {
    id: String(ticket.id),
    ticketCode: ticket.ticketCode,
    title: ticket.title,
    description: 'description' in ticket ? ticket.description : '',
    category: normalizeCategory(ticket.categoryName),
    categoryLabel: ticket.categoryName ?? 'Sin categoria',
    status: mapStatus(ticket.status),
    location: ticket.location,
    images:
      'attachments' in ticket && ticket.attachments
        ? ticket.attachments.map((attachment) =>
            attachment.filePath.startsWith('http')
              ? attachment.filePath
              : `${PUBLIC_API_BASE_URL}${attachment.filePath}`
          )
        : [],
    createdBy: 'createdByUserId' in ticket ? ticket.createdByUserId : '',
    createdByName: ticket.createdByUsername,
    assignedTo: ticket.assignedOperatorId ?? undefined,
    assignedToName: ticket.assignedOperatorUsername ?? undefined,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt ?? ticket.createdAt,
  }
}

function mapComment(comment: BackendComment, ticketId: string, roleNames: string[]): Comment {
  return {
    id: String(comment.id),
    ticketId,
    userId: comment.authorId,
    userName: comment.authorUsername ?? 'Usuario',
    userRole: mapUserRole(roleNames),
    content: comment.content,
    createdAt: comment.createdAt,
  }
}

function mapNewsItem(item: BackendNewsItem): NewsItem {
  return {
    id: String(item.id),
    title: item.title,
    copete: item.copete,
    content: item.content,
    image: item.imageUrl ?? undefined,
    published: item.published,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? item.createdAt,
  }
}

function mapEvent(item: BackendEvent): Event {
  return {
    id: String(item.id),
    title: item.title,
    copete: item.copete,
    description: item.description,
    date: item.eventDate,
    time: item.eventTime.slice(0, 5),
    location: item.location,
    image: item.imageUrl ?? undefined,
    createdAt: item.createdAt ?? undefined,
    updatedAt: item.updatedAt ?? item.createdAt ?? undefined,
  }
}

function formatCreatedAt(timestamp?: number | null): string {
  if (!timestamp) {
    return new Date().toISOString().split('T')[0]
  }

  return new Date(timestamp).toISOString().split('T')[0]
}

function mapAdminUser(user: BackendAdminUser): User {
  const roles = user.roles ?? []

  return {
    id: user.id,
    username: user.username,
    name: `${user.firstName} ${user.lastName}`.trim() || user.username,
    email: user.email,
    role: mapUserRole(roles),
    roles,
    status: user.enabled ? 'active' : 'inactive',
    emailVerified: user.emailVerified,
    createdAt: formatCreatedAt(user.createdTimestamp),
  }
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim().replace(/\s+/g, ' ')
  const [firstName, ...rest] = normalized.split(' ')

  return {
    firstName: firstName || normalized,
    lastName: rest.join(' ') || '-',
  }
}

function mapUserRoleToRoleNames(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return ['ROLE_ADMIN']
    case 'staff':
      return ['ROLE_OPERADOR']
    case 'neighbor':
      return ['ROLE_VECINO']
  }
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    cache: 'no-store',
    headers: {
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    let message = 'Error al comunicarse con el backend'

    try {
      const errorBody = await response.json()
      message = errorBody.message ?? message
    } catch {
      // Ignore parsing errors for non-json bodies.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

function normalizeApiErrorMessage(message: string): string {
  const normalized = message.trim().toLowerCase()

  if (normalized.includes('user exists') || normalized.includes('username already exists')) {
    return 'Ya existe un usuario con ese email.'
  }
  if (normalized.includes('email already exists')) {
    return 'Ya existe un usuario con ese email.'
  }
  if (normalized.includes('invalid role')) {
    return 'El rol seleccionado no es valido.'
  }
  if (normalized.includes('session') && normalized.includes('disponible')) {
    return 'La sesion no esta disponible. Inicia sesion nuevamente.'
  }
  if (normalized.includes('maximo 10 mb') || normalized.includes('10 mb')) {
    return 'La imagen supera el limite de 10 MB.'
  }
  if (normalized.includes('hasta 5 imagenes')) {
    return 'Cada reclamo puede tener hasta 5 imagenes.'
  }
  if (normalized.includes('tipo de archivo') || normalized.includes('content type')) {
    return 'Solo se permiten imagenes JPG, PNG o WEBP.'
  }
  if (normalized.includes('no es una imagen valida')) {
    return 'El archivo no contiene una imagen valida.'
  }

  return message
}

export function getReadableErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error) || !error.message.trim()) {
    return fallback
  }

  return normalizeApiErrorMessage(error.message)
}

function normalizeAttachmentApiPath(attachmentUrl: string): string {
  if (attachmentUrl.startsWith('http')) {
    const url = new URL(attachmentUrl)
    return url.pathname
  }

  return attachmentUrl
}

async function publicApiRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    let message = 'Error al comunicarse con el backend'

    try {
      const errorBody = await response.json()
      message = errorBody.message ?? message
    } catch {
      // Ignore parsing errors for non-json bodies.
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function fetchTicketSummary(token: string): Promise<TicketSummary> {
  return apiRequest<BackendTicketSummary>('/api/tickets/summary', { token })
}

export async function fetchAdminUsers(
  token: string,
  filters: {
    search?: string
    role?: UserRole | 'all'
    enabled?: boolean
    page?: number
    size?: number
  } = {}
): Promise<User[]> {
  const response = await fetchAdminUsersPage(token, filters)
  return response.content
}

export async function fetchAdminUsersPage(
  token: string,
  filters: {
    search?: string
    role?: UserRole | 'all'
    enabled?: boolean
    page?: number
    size?: number
  } = {}
): Promise<FrontendPageResponse<User>> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page ?? 0))
  params.set('size', String(filters.size ?? 10))
  params.set('sort', 'createdTimestamp,desc')

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim())
  }

  if (filters.role && filters.role !== 'all') {
    const roleNames = mapUserRoleToRoleNames(filters.role)
    if (roleNames[0]) {
      params.set('role', roleNames[0])
    }
  }

  if (typeof filters.enabled === 'boolean') {
    params.set('enabled', String(filters.enabled))
  }

  const response = await apiRequest<PageResponse<BackendAdminUser>>(`/api/admin/users?${params.toString()}`, { token })
  return {
    content: response.content.map(mapAdminUser),
    page: response.page,
    size: response.size,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    first: response.first,
    last: response.last,
  }
}

export async function fetchAdminUserRoles(token: string): Promise<string[]> {
  const roles = await apiRequest<BackendAdminRole[]>('/api/admin/users/roles', { token })
  return roles.map((role) => role.name)
}

export async function createAdminUser(
  token: string,
  payload: {
    name: string
    email: string
    password: string
    role: UserRole
  }
): Promise<User> {
  const { firstName, lastName } = splitFullName(payload.name)
  const user = await apiRequest<BackendAdminUser>('/api/admin/users', {
    method: 'POST',
    token,
    body: {
      username: payload.email.trim().toLowerCase(),
      email: payload.email.trim().toLowerCase(),
      firstName,
      lastName,
      enabled: true,
      emailVerified: false,
      password: payload.password,
      roles: mapUserRoleToRoleNames(payload.role),
    },
  })

  return mapAdminUser(user)
}

export async function updateAdminUser(
  token: string,
  userId: string,
  payload: {
    name: string
    email: string
    role: UserRole
    status: 'active' | 'inactive'
    emailVerified?: boolean
  }
): Promise<User> {
  const { firstName, lastName } = splitFullName(payload.name)

  const updated = await apiRequest<BackendAdminUser>(`/api/admin/users/${userId}`, {
    method: 'PUT',
    token,
    body: {
      email: payload.email.trim().toLowerCase(),
      firstName,
      lastName,
      enabled: payload.status === 'active',
      emailVerified: payload.emailVerified ?? false,
    },
  })

  const roleSynced = await apiRequest<BackendAdminUser>(`/api/admin/users/${userId}/roles`, {
    method: 'PATCH',
    token,
    body: {
      roles: mapUserRoleToRoleNames(payload.role),
    },
  })

  return mapAdminUser({
    ...updated,
    roles: roleSynced.roles,
  })
}

export async function updateAdminUserStatus(
  token: string,
  userId: string,
  enabled: boolean
): Promise<User> {
  const user = await apiRequest<BackendAdminUser>(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    token,
    body: { enabled },
  })

  return mapAdminUser(user)
}

export async function resetAdminUserPassword(
  token: string,
  userId: string,
  password: string,
  temporary = false
): Promise<void> {
  await apiRequest<void>(`/api/admin/users/${userId}/password`, {
    method: 'PATCH',
    token,
    body: { password, temporary },
  })
}

export async function fetchPublicNews(): Promise<NewsItem[]> {
  const news = await publicApiRequest<BackendNewsItem[]>('/api/public/news')
  return news.map(mapNewsItem)
}

export async function fetchAdminNews(token: string): Promise<NewsItem[]> {
  const news = await apiRequest<BackendNewsItem[]>('/api/news', { token })
  return news.map(mapNewsItem)
}

export async function fetchPublicNewsDetail(newsId: string): Promise<NewsItem> {
  const news = await publicApiRequest<BackendNewsItem>(`/api/public/news/${newsId}`)
  return mapNewsItem(news)
}

export async function createNews(
  token: string,
  payload: {
    title: string
    copete: string
    content: string
    image?: string
    published: boolean
  }
): Promise<NewsItem> {
  const news = await apiRequest<BackendNewsItem>('/api/news', {
    method: 'POST',
    token,
    body: {
      title: payload.title,
      copete: payload.copete,
      content: payload.content,
      imageUrl: payload.image?.trim() ? payload.image.trim() : null,
      published: payload.published,
    },
  })

  return mapNewsItem(news)
}

export async function updateNews(
  token: string,
  newsId: string,
  payload: {
    title: string
    copete: string
    content: string
    image?: string
    published: boolean
  }
): Promise<NewsItem> {
  const news = await apiRequest<BackendNewsItem>(`/api/news/${newsId}`, {
    method: 'PUT',
    token,
    body: {
      title: payload.title,
      copete: payload.copete,
      content: payload.content,
      imageUrl: payload.image?.trim() ? payload.image.trim() : null,
      published: payload.published,
    },
  })

  return mapNewsItem(news)
}

export async function deleteNews(token: string, newsId: string): Promise<void> {
  await fetch(`${getApiBaseUrl()}/api/news/${newsId}`, {
    method: 'DELETE',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      let message = 'Error al comunicarse con el backend'

      try {
        const errorBody = await response.json()
        message = errorBody.message ?? message
      } catch {
        // Ignore parsing errors for non-json bodies.
      }

      throw new Error(message)
    }
  })
}

export async function fetchPublicEvents(): Promise<Event[]> {
  const events = await publicApiRequest<BackendEvent[]>('/api/public/events')
  return events.map(mapEvent)
}

export async function fetchAdminEvents(token: string): Promise<Event[]> {
  const events = await apiRequest<BackendEvent[]>('/api/events', { token })
  return events.map(mapEvent)
}

export async function fetchPublicEventDetail(eventId: string): Promise<Event> {
  const event = await publicApiRequest<BackendEvent>(`/api/public/events/${eventId}`)
  return mapEvent(event)
}

export async function createEvent(
  token: string,
  payload: {
    title: string
    copete: string
    description: string
    date: string
    time: string
    location: string
    image?: string
  }
): Promise<Event> {
  const event = await apiRequest<BackendEvent>('/api/events', {
    method: 'POST',
    token,
    body: {
      title: payload.title,
      copete: payload.copete,
      description: payload.description,
      eventDate: payload.date,
      eventTime: payload.time.length === 5 ? `${payload.time}:00` : payload.time,
      location: payload.location,
      imageUrl: payload.image?.trim() ? payload.image.trim() : null,
    },
  })

  return mapEvent(event)
}

export async function updateEvent(
  token: string,
  eventId: string,
  payload: {
    title: string
    copete: string
    description: string
    date: string
    time: string
    location: string
    image?: string
  }
): Promise<Event> {
  const event = await apiRequest<BackendEvent>(`/api/events/${eventId}`, {
    method: 'PUT',
    token,
    body: {
      title: payload.title,
      copete: payload.copete,
      description: payload.description,
      eventDate: payload.date,
      eventTime: payload.time.length === 5 ? `${payload.time}:00` : payload.time,
      location: payload.location,
      imageUrl: payload.image?.trim() ? payload.image.trim() : null,
    },
  })

  return mapEvent(event)
}

export async function deleteEvent(token: string, eventId: string): Promise<void> {
  await fetch(`${getApiBaseUrl()}/api/events/${eventId}`, {
    method: 'DELETE',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      let message = 'Error al comunicarse con el backend'

      try {
        const errorBody = await response.json()
        message = errorBody.message ?? message
      } catch {
        // Ignore parsing errors for non-json bodies.
      }

      throw new Error(message)
    }
  })
}

export async function fetchNeighborTickets(
  token: string,
  filters: TicketQueryFilters = {}
): Promise<Ticket[]> {
  const params = new URLSearchParams()
  params.set('mine', 'true')
  params.set('sort', 'createdAt,desc')

  if (filters.q?.trim()) {
    params.set('q', filters.q.trim())
  }

  if (filters.status) {
    params.set('status', STATUS_TO_BACKEND[filters.status])
  }

  if (filters.categoryId) {
    params.set('categoryId', String(filters.categoryId))
  }

  const page = await apiRequest<PageResponse<BackendTicketListItem>>(`/api/tickets?${params.toString()}`, { token })
  return page.content.map(mapTicket)
}

export async function fetchSystemTickets(
  token: string,
  filters: TicketQueryFilters = {}
): Promise<Ticket[]> {
  const params = new URLSearchParams()
  params.set('sort', 'createdAt,desc')

  if (filters.q?.trim()) {
    params.set('q', filters.q.trim())
  }

  if (filters.status) {
    params.set('status', STATUS_TO_BACKEND[filters.status])
  }

  if (filters.categoryId) {
    params.set('categoryId', String(filters.categoryId))
  }

  const page = await apiRequest<PageResponse<BackendTicketListItem>>(`/api/tickets?${params.toString()}`, { token })
  return page.content.map(mapTicket)
}

export async function fetchNeighborTicketDetail(token: string, ticketId: string, roleNames: string[]): Promise<{
  ticket: Ticket
  comments: Comment[]
}> {
  const detail = await apiRequest<BackendTicketDetail>(`/api/tickets/${ticketId}`, { token })

  return {
    ticket: mapTicket(detail),
    comments: (detail.comments ?? []).map((comment) => mapComment(comment, String(detail.id), roleNames)),
  }
}

export async function fetchTicketDetail(token: string, ticketId: string, roleNames: string[]): Promise<{
  ticket: Ticket
  comments: Comment[]
}> {
  return fetchNeighborTicketDetail(token, ticketId, roleNames)
}

export async function createTicket(
  token: string,
  payload: {
    title: string
    description: string
    location: string
    categoryId: number
  }
): Promise<Ticket> {
  const detail = await apiRequest<BackendTicketDetail>('/api/tickets', {
    method: 'POST',
    token,
    body: {
      ...payload,
      priority: 'MEDIUM',
    },
  })

  return mapTicket(detail)
}

export async function createTicketComment(
  token: string,
  ticketId: string,
  content: string,
  roleNames: string[]
): Promise<Comment> {
  const comment = await apiRequest<BackendComment>(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    token,
    body: { content },
  })

  return mapComment(comment, ticketId, roleNames)
}

export async function updateTicketStatus(
  token: string,
  ticketId: string,
  status: Ticket['status']
): Promise<Ticket> {
  const detail = await apiRequest<BackendTicketDetail>(`/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    token,
    body: { status: STATUS_TO_BACKEND[status] },
  })

  return mapTicket(detail)
}

export async function assignTicket(
  token: string,
  ticketId: string,
  payload: {
    assignedOperatorId: string | null
    assignedOperatorUsername?: string | null
  }
): Promise<Ticket> {
  const detail = await apiRequest<BackendTicketDetail>(`/api/tickets/${ticketId}/assignment`, {
    method: 'PATCH',
    token,
    body: payload,
  })

  return mapTicket(detail)
}

export async function fetchTicketCategories(token: string): Promise<TicketCategoryOption[]> {
  const categories = await apiRequest<BackendCategory[]>('/api/ticket-categories', { token })

  return categories.map((category) => ({
    id: category.id,
    value: normalizeCategory(category.name),
    label: category.name,
  }))
}

export async function uploadTicketAttachment(token: string, ticketId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${getApiBaseUrl()}/api/tickets/${ticketId}/attachments`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    let message = 'No se pudo subir una de las imagenes'

    try {
      const errorBody = await response.json()
      message = errorBody.message ?? message
    } catch {
      // ignore
    }

    throw new Error(message)
  }

  return response.json()
}

export async function deleteTicketAttachment(token: string, attachmentUrl: string): Promise<void> {
  const filePath = normalizeAttachmentApiPath(attachmentUrl)
  const attachmentId = filePath.match(/\/api\/tickets\/attachments\/(\d+)\/file$/)?.[1]

  if (!attachmentId) {
    throw new Error('No se pudo identificar el adjunto a eliminar')
  }

  await apiRequest<void>(`/api/tickets/attachments/${attachmentId}`, {
    method: 'DELETE',
    token,
  })
}

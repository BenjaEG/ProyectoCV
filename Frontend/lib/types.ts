export type UserRole = 'neighbor' | 'staff' | 'admin'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  name: string
  username?: string
  email: string
  role: UserRole
  roles?: string[]
  status: UserStatus
  emailVerified?: boolean
  avatar?: string
  createdAt: string
}

export type TicketStatus = 'open' | 'in_review' | 'in_progress' | 'resolved' | 'closed'
export type TicketCategory = 'lighting' | 'garbage' | 'streets' | 'security' | 'other'

export interface Ticket {
  id: string
  ticketCode: string
  title: string
  description: string
  category: TicketCategory
  categoryLabel: string
  status: TicketStatus
  location: string
  images: string[]
  createdBy: string
  createdByName: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  ticketId: string
  userId: string
  userName: string
  userRole: UserRole
  content: string
  createdAt: string
}

export interface NewsItem {
  id: string
  title: string
  copete: string
  content: string
  image?: string
  published: boolean
  createdAt: string
  updatedAt?: string
}

export interface Event {
  id: string
  title: string
  copete: string
  description: string
  date: string
  time: string
  location: string
  image?: string
  createdAt?: string
  updatedAt?: string
}

export interface TicketCategoryOption {
  id: number
  value: TicketCategory
  label: string
}

export interface TicketSummary {
  total: number
  open: number
  inReview: number
  inProgress: number
  resolved: number
  closed: number
}

export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'lighting', label: 'Iluminacion' },
  { value: 'garbage', label: 'Basura' },
  { value: 'streets', label: 'Calles' },
  { value: 'security', label: 'Seguridad' },
  { value: 'other', label: 'Otro' },
]

export const TICKET_STATUSES: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Abierto', color: 'bg-blue-500' },
  { value: 'in_review', label: 'En revision', color: 'bg-yellow-500' },
  { value: 'in_progress', label: 'En progreso', color: 'bg-purple-500' },
  { value: 'resolved', label: 'Resuelto', color: 'bg-green-500' },
  { value: 'closed', label: 'Cerrado', color: 'bg-gray-500' },
]

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'neighbor', label: 'Vecino' },
  { value: 'staff', label: 'Personal' },
  { value: 'admin', label: 'Administrador' },
]

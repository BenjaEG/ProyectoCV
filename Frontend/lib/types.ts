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

export type SocioTipo = 'aportante' | 'adherente' | 'honorario'
export type SocioEstado = 'activo' | 'baja' | 'moroso'
export type EstadoPagoCuota = 'pendiente' | 'pagada' | 'vencida' | 'anulada'
export type TipoComprobanteDoc = 'recibo' | 'comprobante_interno'
export type EstadoComprobante = 'emitido' | 'anulado'
export type OrigenComprobante = 'pago_socio' | 'gastos_uso_salon_comunitario' | 'evento' | 'donacion' | 'otro'

export interface Socio {
  id: string
  userId?: string
  nombre: string
  apellido: string
  nombreCompleto: string
  dni: string
  domicilio: string
  fechaAlta: string
  fechaBaja?: string
  tipo: SocioTipo
  estado: SocioEstado
  observaciones?: string
  createdAt?: string
  updatedAt?: string
}

export interface CuotaSocio {
  id: string
  socioId: string
  periodo: string
  monto: number
  estadoPago: EstadoPagoCuota
  fechaVencimiento: string
  fechaPago?: string
  tipoComprobante?: string
  numeroComprobante?: string
  medioPago?: string
  observacion?: string
  createdAt?: string
  updatedAt?: string
}

export interface Comprobante {
  id: string
  numero: string
  tipo: TipoComprobanteDoc
  estado: EstadoComprobante
  origen: OrigenComprobante
  fechaEmision: string
  concepto: string
  descripcion?: string
  monto: number
  medioPago?: string
  socioId?: string
  socioNombreCompleto?: string
  socioDni?: string
  nombrePagador: string
  dniPagador?: string
  referenciaOrigenId?: string
  observaciones?: string
  createdByUsername: string
  createdAt?: string
  updatedAt?: string
  anulledAt?: string
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

export const SOCIO_TIPOS: { value: SocioTipo; label: string }[] = [
  { value: 'aportante', label: 'Aportante' },
  { value: 'adherente', label: 'Adherente' },
  { value: 'honorario', label: 'Honorario' },
]

export const SOCIO_ESTADOS: { value: SocioEstado; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'baja', label: 'Baja' },
  { value: 'moroso', label: 'Moroso' },
]

export const CUOTA_ESTADOS: { value: EstadoPagoCuota; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'anulada', label: 'Anulada' },
]

export const COMPROBANTE_TIPOS: { value: TipoComprobanteDoc; label: string }[] = [
  { value: 'recibo', label: 'Recibo' },
  { value: 'comprobante_interno', label: 'Comprobante interno' },
]

export const COMPROBANTE_ESTADOS: { value: EstadoComprobante; label: string }[] = [
  { value: 'emitido', label: 'Emitido' },
  { value: 'anulado', label: 'Anulado' },
]

export const COMPROBANTE_ORIGENES: { value: OrigenComprobante; label: string }[] = [
  { value: 'pago_socio', label: 'Pago socio' },
  { value: 'gastos_uso_salon_comunitario', label: 'Gastos por uso de Salon Comunitario' },
  { value: 'evento', label: 'Evento' },
  { value: 'donacion', label: 'Donación' },
  { value: 'otro', label: 'Otro' },
]

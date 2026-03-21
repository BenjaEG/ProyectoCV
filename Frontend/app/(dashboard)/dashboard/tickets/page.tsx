'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/tickets/status-badge'
import { CategoryBadge } from '@/components/tickets/category-badge'
import { fetchNeighborTickets, fetchTicketCategories } from '@/lib/api'
import { TICKET_STATUSES, type TicketCategoryOption, type TicketStatus, type Ticket } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Plus, Search, Ticket as TicketIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function TicketsPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categories, setCategories] = useState<TicketCategoryOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadData() {
      try {
        setIsLoading(true)
        const [nextTickets, nextCategories] = await Promise.all([
          fetchNeighborTickets(token),
          fetchTicketCategories(token),
        ])

        if (cancelled) {
          return
        }

        setTickets(nextTickets)
        setCategories(nextCategories)
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'No se pudieron cargar los reclamos')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [token])

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const normalizedSearch = search.trim().toLowerCase()
      const matchesSearch = normalizedSearch.length === 0 ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.ticketCode.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || String(ticket.categoryLabel) === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [categoryFilter, search, statusFilter, tickets])

  return (
    <>
      <DashboardHeader title="Mis Reclamos" description="Gestiona tus reclamos y seguimiento" />
      <main className="flex-1 p-6 md:p-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Listado de Reclamos</CardTitle>
            <Link href="/dashboard/tickets/new">
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Reclamo
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
                <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {TICKET_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.label}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando reclamos...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-12 text-center">
                <TicketIcon className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium text-foreground">No hay reclamos</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {search || statusFilter !== 'all' || categoryFilter !== 'all'
                      ? 'No se encontraron reclamos con los filtros aplicados'
                      : 'No tienes reclamos todavía. Crea uno nuevo para comenzar.'}
                  </p>
                </div>
                {!search && statusFilter === 'all' && categoryFilter === 'all' && (
                  <Link href="/dashboard/tickets/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Reclamo
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Título</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Categoría</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer border-border hover:bg-secondary/30"
                        onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground py-4">
                          <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:text-primary" onClick={(event) => event.stopPropagation()}>
                            {ticket.ticketCode}
                          </Link>
                        </TableCell>
                        <TableCell className="py-4">
                          <Link href={`/dashboard/tickets/${ticket.id}`} className="text-[15px] text-foreground hover:text-primary font-medium" onClick={(event) => event.stopPropagation()}>
                            {ticket.title}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4">
                          <CategoryBadge category={ticket.category} />
                        </TableCell>
                        <TableCell className="py-4">
                          <StatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell py-4">
                          {new Date(ticket.createdAt).toLocaleDateString('es-AR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

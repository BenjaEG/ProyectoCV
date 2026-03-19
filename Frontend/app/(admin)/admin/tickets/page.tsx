'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/tickets/status-badge'
import { CategoryBadge } from '@/components/tickets/category-badge'
import { fetchSystemTickets, fetchTicketCategories } from '@/lib/api'
import { TICKET_STATUSES, type TicketCategoryOption, type TicketStatus, type Ticket } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Search, Ticket as TicketIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminTicketsPage() {
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

    async function loadCategories() {
      try {
        const nextCategories = await fetchTicketCategories(token)

        if (!cancelled) {
          setCategories(nextCategories)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'No se pudieron cargar las categorías')
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadTickets() {
      try {
        setIsLoading(true)

        const selectedCategory = categoryFilter === 'all'
          ? undefined
          : categories.find((category) => String(category.id) === categoryFilter)?.id

        const nextTickets = await fetchSystemTickets(token, {
          q: search || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          categoryId: selectedCategory,
        })

        if (cancelled) {
          return
        }

        setTickets(nextTickets)
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

    void loadTickets()

    return () => {
      cancelled = true
    }
  }, [categoryFilter, search, statusFilter, token, categories])

  return (
    <>
      <DashboardHeader title="Todos los Reclamos" description="Vista administrativa de reclamos" />
      <main className="flex-1 p-4 md:p-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Reclamos del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, ID o vecino..."
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
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando reclamos...
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-12 text-center">
                <TicketIcon className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium text-foreground">No hay reclamos</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No se encontraron reclamos con los filtros aplicados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Título</TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">Vecino</TableHead>
                      <TableHead className="text-muted-foreground hidden lg:table-cell">Categoría</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground hidden xl:table-cell">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id} className="border-border">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          <Link href={`/admin/tickets/${ticket.id}`} className="hover:text-primary">
                            {ticket.ticketCode}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/tickets/${ticket.id}`} className="text-foreground hover:text-primary font-medium">
                            {ticket.title}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {ticket.createdByName}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <CategoryBadge category={ticket.category} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden xl:table-cell">
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

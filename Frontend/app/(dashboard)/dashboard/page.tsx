'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Ticket, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/tickets/status-badge'
import { useAuth } from '@/hooks/use-auth'
import { fetchNeighborTickets, fetchTicketSummary } from '@/lib/api'
import type { Ticket as AppTicket, TicketSummary } from '@/lib/types'
import { toast } from 'sonner'

const EMPTY_SUMMARY: TicketSummary = {
  total: 0,
  open: 0,
  inReview: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
}

export default function DashboardPage() {
  const { token, username } = useAuth()
  const [summary, setSummary] = useState<TicketSummary>(EMPTY_SUMMARY)
  const [tickets, setTickets] = useState<AppTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadDashboard() {
      try {
        setIsLoading(true)
        const [nextSummary, nextTickets] = await Promise.all([
          fetchTicketSummary(token),
          fetchNeighborTickets(token),
        ])

        if (cancelled) {
          return
        }

        setSummary(nextSummary)
        setTickets(nextTickets)
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'No se pudo cargar el panel')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [token])

  const stats = [
    {
      title: 'Total de Reclamos',
      value: summary.total,
      icon: Ticket,
      color: 'text-primary',
    },
    {
      title: 'Abiertos',
      value: summary.open,
      icon: AlertCircle,
      color: 'text-blue-500',
    },
    {
      title: 'En Progreso',
      value: summary.inReview + summary.inProgress,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Resueltos',
      value: summary.resolved + summary.closed,
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ]

  return (
    <>
      <DashboardHeader
        title="Panel de Control"
        description={`Bienvenido, ${username ?? 'vecino'}`}
      />
      <main className="flex-1 p-6 md:p-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium tracking-wide text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Reclamos Recientes</CardTitle>
            <Link href="/dashboard/tickets">
              <Button variant="outline" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando reclamos...
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tienes reclamos todavía</p>
                <Link href="/dashboard/tickets/new">
                  <Button>Crear tu primer reclamo</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium text-[15px] text-foreground truncate">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{ticket.ticketCode}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

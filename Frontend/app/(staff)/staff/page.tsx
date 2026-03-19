'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchSystemTickets, fetchTicketSummary } from '@/lib/api'
import type { TicketSummary, Ticket } from '@/lib/types'
import { Ticket as TicketIcon, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/tickets/status-badge'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

const EMPTY_SUMMARY: TicketSummary = {
  total: 0,
  open: 0,
  inReview: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
}

export default function StaffDashboardPage() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<TicketSummary>(EMPTY_SUMMARY)
  const [openTickets, setOpenTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadDashboard() {
      try {
        setIsLoading(true)
        const [nextSummary, nextOpenTickets] = await Promise.all([
          fetchTicketSummary(token),
          fetchSystemTickets(token, { status: 'open' }),
        ])

        if (cancelled) {
          return
        }

        setSummary(nextSummary)
        setOpenTickets(nextOpenTickets)
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
      title: 'Total Reclamos',
      value: summary.total,
      icon: TicketIcon,
      color: 'text-primary',
    },
    {
      title: 'Pendientes',
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
        title="Panel de Personal" 
        description="Gestión de reclamos vecinales"
      />
      <main className="flex-1 p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Tickets */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Reclamos Pendientes</CardTitle>
            <Link href="/staff/tickets">
              <Button variant="outline" size="sm">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Cargando reclamos...
              </div>
            ) : openTickets.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No hay reclamos pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openTickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/staff/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.ticketCode} - {ticket.createdByName}
                      </p>
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

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAdminUsersPage, fetchSystemTickets, fetchTicketSummary, getReadableErrorMessage } from '@/lib/api'
import type { TicketSummary, Ticket, User } from '@/lib/types'
import { Ticket as TicketIcon, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function AdminDashboardPage() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<TicketSummary>(EMPTY_SUMMARY)
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    neighbors: 0,
    staff: 0,
  })
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function loadDashboard() {
      try {
        setIsLoadingTickets(true)
        const [nextSummary, nextRecentTickets, usersPage, activeUsersPage, neighborsPage, staffPage] = await Promise.all([
          fetchTicketSummary(token),
          fetchSystemTickets(token),
          fetchAdminUsersPage(token, { page: 0, size: 5 }),
          fetchAdminUsersPage(token, { page: 0, size: 1, enabled: true }),
          fetchAdminUsersPage(token, { page: 0, size: 1, role: 'neighbor' }),
          fetchAdminUsersPage(token, { page: 0, size: 1, role: 'staff' }),
        ])

        if (cancelled) {
          return
        }

        setSummary(nextSummary)
        setRecentTickets(nextRecentTickets)
        setRecentUsers(usersPage.content.slice(0, 5))
        setUserStats({
          total: usersPage.totalElements,
          active: activeUsersPage.totalElements,
          neighbors: neighborsPage.totalElements,
          staff: staffPage.totalElements,
        })
      } catch (error) {
        if (!cancelled) {
          toast.error(getReadableErrorMessage(error, 'No se pudo cargar el panel'))
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTickets(false)
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
      title: 'Total Usuarios',
      value: userStats.total,
      subtitle: `${userStats.active} activos`,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Vecinos',
      value: userStats.neighbors,
      subtitle: 'registrados',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Personal',
      value: userStats.staff,
      subtitle: 'miembros',
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Reclamos',
      value: summary.total,
      subtitle: `${summary.open} pendientes`,
      icon: TicketIcon,
      color: 'text-yellow-500',
    },
  ]

  return (
    <>
      <DashboardHeader 
        title="Panel de Administración" 
        description="Vista general del sistema"
      />
      <main className="flex-1 p-6 md:p-8">
        {/* Stats Grid */}
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
                <p className="text-sm text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Usuarios Recientes</CardTitle>
              <Link href="/admin/users">
                <Button variant="outline" size="sm">Ver todos</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium text-[15px] text-foreground truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <div className="rounded-lg bg-secondary/30 p-4 text-sm text-muted-foreground">
                    No hay usuarios cargados todavia.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Reclamos Recientes</CardTitle>
              <Link href="/admin/tickets">
                <Button variant="outline" size="sm">Ver todos</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingTickets ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cargando reclamos...
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-4"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-[15px] text-foreground truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {ticket.ticketCode} - {ticket.createdByName}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          ticket.status === 'open' ? 'border-blue-500 text-blue-500' :
                          ticket.status === 'resolved' || ticket.status === 'closed' ? 'border-green-500 text-green-500' :
                          'border-yellow-500 text-yellow-500'
                        }
                      >
                        {ticket.status === 'open' ? 'Abierto' :
                         ticket.status === 'resolved' || ticket.status === 'closed' ? 'Resuelto' : 'En progreso'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

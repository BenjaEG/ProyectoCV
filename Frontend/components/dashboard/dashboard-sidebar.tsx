'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronUp, CreditCard, KeyRound, LayoutDashboard, LogOut, MapPinned, PlusCircle, Ticket, User } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const menuItems = [
  {
    title: 'Panel',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Mis Reclamos',
    url: '/dashboard/tickets',
    icon: Ticket,
  },
  {
    title: 'Crear Reclamo',
    url: '/dashboard/tickets/new',
    icon: PlusCircle,
  },
  {
    title: 'Mis Pagos',
    url: '/dashboard/cuotas',
    icon: CreditCard,
  },
  {
    title: 'Mi Perfil',
    url: '/dashboard/profile',
    icon: User,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { username, logout, manageAccount } = useAuth()
  const displayName = username ?? 'Usuario'

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 px-2 py-4">
          <MapPinned className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">Centro Vecinal</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{displayName}</span>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56 bg-popover border-border">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void manageAccount()} className="cursor-pointer">
                  <div className="flex items-center">
                    <KeyRound className="mr-2 h-4 w-4" />
                    <span>Gestionar cuenta</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void logout()} className="cursor-pointer text-destructive">
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

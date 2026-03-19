import { ProtectedRoute } from '@/components/auth/auth-provider'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['ROLE_VECINO', 'ROLE_ADMIN']}>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="bg-background">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

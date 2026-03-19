import { ProtectedRoute } from '@/components/auth/auth-provider'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { StaffSidebar } from '@/components/staff/staff-sidebar'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['ROLE_OPERADOR', 'ROLE_ADMIN']}>
      <SidebarProvider>
        <StaffSidebar />
        <SidebarInset className="bg-background">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

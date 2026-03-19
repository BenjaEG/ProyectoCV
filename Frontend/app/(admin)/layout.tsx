import { ProtectedRoute } from '@/components/auth/auth-provider'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-background">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

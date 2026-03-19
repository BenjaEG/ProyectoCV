'use client'

import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { useAuth } from '@/hooks/use-auth'
import {
  createAdminUser,
  fetchAdminUsersPage,
  getReadableErrorMessage,
  updateAdminUser,
  updateAdminUserStatus,
} from '@/lib/api'
import { USER_ROLES, type UserRole, type User } from '@/lib/types'
import { Plus, Search, Users, Loader2, Pencil, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const { token, initialized } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  
  // Form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('neighbor')

  const pageSize = 10

  useEffect(() => {
    setPage(0)
  }, [search, roleFilter])

  useEffect(() => {
    if (!initialized || !token) {
      return
    }

    let cancelled = false

    const loadUsers = async () => {
      try {
        setIsPageLoading(true)
        setPageError(null)
        const data = await fetchAdminUsersPage(token, {
          search,
          role: roleFilter,
          page,
          size: pageSize,
        })
        if (!cancelled) {
          setUsers(data.content)
          setTotalPages(data.totalPages)
          setTotalElements(data.totalElements)
        }
      } catch (error) {
        if (!cancelled) {
          const message = getReadableErrorMessage(error, 'No se pudieron cargar los usuarios')
          setPageError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsPageLoading(false)
        }
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [initialized, page, roleFilter, search, token])

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormRole('neighbor')
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormPassword('')
    setFormRole(user.role)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('La sesion no esta disponible')
      return
    }

    setIsLoading(true)

    try {
      if (editingUser) {
        const updatedUser = await updateAdminUser(token, editingUser.id, {
          name: formName,
          email: formEmail,
          role: formRole,
          status: editingUser.status,
          emailVerified: editingUser.emailVerified,
        })
        setUsers((current) => current.map((u) => (u.id === editingUser.id ? updatedUser : u)))
        toast.success('Usuario actualizado correctamente')
      } else {
        const newUser = await createAdminUser(token, {
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        })
        const matchesCurrentRoleFilter = roleFilter === 'all' || roleFilter === newUser.role
        const nextTotalElements = totalElements + 1
        setPage(0)
        setUsers((current) => matchesCurrentRoleFilter ? [newUser, ...current].slice(0, pageSize) : current)
        setTotalElements(nextTotalElements)
        setTotalPages(Math.max(1, Math.ceil(nextTotalElements / pageSize)))
        toast.success('Usuario creado correctamente. Debera cambiar su contraseña en el primer ingreso.')
      }

      setIsDialogOpen(false)
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo guardar el usuario'))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    if (!token) {
      toast.error('La sesion no esta disponible')
      return
    }

    const currentUser = users.find((user) => user.id === userId)
    if (!currentUser) {
      return
    }

    try {
      const updatedUser = await updateAdminUserStatus(token, userId, currentUser.status !== 'active')
      setUsers((current) => current.map((user) => (user.id === userId ? updatedUser : user)))
      toast.success(updatedUser.status === 'active' ? 'Usuario activado' : 'Usuario desactivado')
    } catch (error) {
      toast.error(getReadableErrorMessage(error, 'No se pudo actualizar el estado'))
    }
  }

  const getRoleLabel = (role: UserRole) => {
    return USER_ROLES.find((r) => r.value === role)?.label || role
  }

  return (
    <>
      <DashboardHeader title="Gestión de Usuarios" description="Administra los usuarios del sistema" />
      <main className="flex-1 p-4 md:p-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-foreground">Usuarios</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {editingUser ? 'Modifica los datos del usuario' : 'Completa los datos del nuevo usuario'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
                      <Input
                        id="name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                        className="bg-secondary border-border"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        required
                        className="bg-secondary border-border"
                      />
                    </Field>
                    {!editingUser && (
                      <Field>
                        <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                        <Input
                          id="password"
                          type="password"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          required={!editingUser}
                          className="bg-secondary border-border"
                        />
                      </Field>
                    )}
                    <Field>
                      <FieldLabel htmlFor="role">Rol</FieldLabel>
                      <Select value={formRole} onValueChange={(v) => setFormRole(v as UserRole)}>
                        <SelectTrigger id="role" className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingUser ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        editingUser ? 'Actualizar' : 'Crear'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {pageError && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{pageError}</span>
              </div>
            )}

            {/* Table */}
            {isPageLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <Empty
                icon={Users}
                title="No hay usuarios"
                description="No se encontraron usuarios con los filtros aplicados"
              />
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Nombre</TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-muted-foreground">Rol</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          {user.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-foreground">
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.status === 'active' ? 'Desactivar' : 'Activar'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isPageLoading && users.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(page * pageSize) + 1} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} usuarios
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="min-w-20 text-center text-sm text-muted-foreground">
                    Pagina {page + 1} de {Math.max(totalPages, 1)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Siguiente
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}

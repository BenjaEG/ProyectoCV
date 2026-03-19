'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type Keycloak from 'keycloak-js'
import { Loader2 } from 'lucide-react'
import { keycloak } from '@/lib/keycloak'

type AuthContextValue = {
  initialized: boolean
  isAuthenticated: boolean
  token?: string
  userId?: string
  username?: string
  email?: string
  roles: string[]
  login: (redirectPath?: string) => Promise<void>
  register: (redirectPath?: string) => Promise<void>
  logout: () => Promise<void>
  manageAccount: () => Promise<void>
  changePassword: () => Promise<void>
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function extractRoles(instance: Keycloak): string[] {
  const realmRoles = instance.realmAccess?.roles ?? []
  const tokenRoles = Array.isArray(instance.tokenParsed?.roles) ? instance.tokenParsed.roles : []

  return Array.from(
    new Set(
      [...realmRoles, ...tokenRoles]
        .map((role) => (role.startsWith('ROLE_') ? role : `ROLE_${role}`))
    )
  )
}

function getDefaultRoute(): string {
  return '/'
}

function buildCallbackUrl(targetPath: string) {
  const callbackUrl = new URL('/auth/callback', window.location.origin)
  callbackUrl.searchParams.set('next', targetPath)
  return callbackUrl.toString()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | undefined>()
  const [userId, setUserId] = useState<string | undefined>()
  const [username, setUsername] = useState<string | undefined>()
  const [email, setEmail] = useState<string | undefined>()
  const [roles, setRoles] = useState<string[]>([])
  const initStartedRef = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (initStartedRef.current) {
      return
    }

    initStartedRef.current = true

    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        const nextRoles = extractRoles(keycloak)
        setIsAuthenticated(authenticated)
        setToken(keycloak.token)
        setUserId(keycloak.tokenParsed?.sub as string | undefined)
        setUsername(keycloak.tokenParsed?.preferred_username as string | undefined)
        setEmail(keycloak.tokenParsed?.email as string | undefined)
        setRoles(nextRoles)
        setInitialized(true)

        if (authenticated && (pathname === '/login' || pathname === '/register')) {
          router.replace(getDefaultRoute())
        }
      })
      .catch((error) => {
        console.error('Keycloak init failed', error)
        setInitialized(true)
      })

    keycloak.onAuthSuccess = () => {
        const nextRoles = extractRoles(keycloak)
        setIsAuthenticated(true)
        setToken(keycloak.token)
        setUserId(keycloak.tokenParsed?.sub as string | undefined)
        setUsername(keycloak.tokenParsed?.preferred_username as string | undefined)
        setEmail(keycloak.tokenParsed?.email as string | undefined)
        setRoles(nextRoles)
      }

    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false)
      setToken(undefined)
      setUserId(undefined)
      setUsername(undefined)
      setEmail(undefined)
      setRoles([])
    }

    keycloak.onTokenExpired = async () => {
      try {
        const refreshed = await keycloak.updateToken(30)
        if (refreshed) {
          setToken(keycloak.token)
        }
      } catch (error) {
        console.error('Keycloak token refresh failed', error)
        await keycloak.logout({
          redirectUri: window.location.origin,
        })
      }
    }
  }, [pathname, router])

  const login = useCallback(async (redirectPath?: string) => {
    await keycloak.login({
      redirectUri: buildCallbackUrl(redirectPath ?? getDefaultRoute()),
    })
  }, [])

  const register = useCallback(async (redirectPath?: string) => {
    await keycloak.register({
      redirectUri: buildCallbackUrl(redirectPath ?? getDefaultRoute()),
    })
  }, [])

  const logout = useCallback(async () => {
    await keycloak.logout({
      redirectUri: window.location.origin,
    })
  }, [])

  const manageAccount = useCallback(async () => {
    window.location.assign(
      keycloak.createAccountUrl({
        redirectUri: window.location.href,
      })
    )
  }, [])

  const changePassword = useCallback(async () => {
    await keycloak.login({
      action: 'UPDATE_PASSWORD',
      redirectUri: window.location.href,
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      isAuthenticated,
      token,
      userId,
      username,
      email,
      roles,
      login,
      register,
      logout,
      manageAccount,
      changePassword,
      hasRole: (role: string) => roles.includes(role.startsWith('ROLE_') ? role : `ROLE_${role}`),
    }),
    [initialized, isAuthenticated, token, userId, username, email, roles, login, register, logout, manageAccount, changePassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: string[]
  children: ReactNode
}) {
  const { initialized, isAuthenticated, hasRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!initialized || isAuthenticated) {
      return
    }

    const next = encodeURIComponent(pathname || '/')
    router.replace(`/login?next=${next}`)
  }, [initialized, isAuthenticated, pathname, router])

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Redirigiendo al acceso...
      </div>
    )
  }

  const isAllowed = allowedRoles.some((role) => hasRole(role))

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Acceso denegado</h1>
          <p className="mt-2 text-muted-foreground">
            Tu usuario no tiene permisos para acceder a esta seccion.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  BarChart3,
  FileText,
  X,
  MapPin,
  ShoppingCart,
  DollarSign,
  CreditCard,
  UserCheck,
  Wallet,
  XCircle,
  RotateCcw,
  Building2,
  FileCheck,
  MessageSquare,
  CheckSquare,
  User,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Locale, defaultLocale } from '@/lib/i18n/config'
import { useAuth } from '@/lib/auth-context'
import { UserRole } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface SideNavProps {
  open: boolean
  onClose: () => void
}

const navigationConfig = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: null },
  {
    key: 'masterData',
    items: [
      { key: 'clients', href: '/clients', icon: Users, roles: null },
      { key: 'landInventory', href: '/land', icon: MapPin, roles: null },
    ],
  },
  {
    key: 'salesCollections',
    items: [
      { key: 'sales', href: '/sales', icon: ShoppingCart, roles: null },
      { key: 'collections', href: '/collections', icon: DollarSign, roles: null },
    ],
  },
  {
    key: 'expensesPayroll',
    items: [
      { key: 'expenses', href: '/expenses', icon: CreditCard, roles: null },
      { key: 'employees', href: '/employees', icon: UserCheck, roles: null },
      { key: 'payroll', href: '/payroll', icon: Wallet, roles: [UserRole.ACCOUNT_MANAGER, UserRole.HOF, UserRole.ADMIN] },
    ],
  },
  {
    key: 'cancellationsRefunds',
    items: [
      { key: 'cancellations', href: '/cancellations', icon: XCircle, roles: null },
      { key: 'refunds', href: '/refunds', icon: RotateCcw, roles: null },
    ],
  },
  { key: 'banking', href: '/banking', icon: Building2, roles: [UserRole.HOF, UserRole.ADMIN] },
  { key: 'approvals', href: '/approvals', icon: CheckSquare, roles: [UserRole.HOF, UserRole.ADMIN] },
  { key: 'reports', href: '/reports', icon: BarChart3, roles: null },
  { key: 'sms', href: '/sms', icon: MessageSquare, roles: [UserRole.ADMIN] },
  { key: 'settings', href: '/settings', icon: Settings, roles: [UserRole.ADMIN] },
]

export function SideNav({ open, onClose }: SideNavProps) {
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = (params.locale as Locale) || defaultLocale
  const { user, logout } = useAuth()
  const router = useRouter()

  // Helper to create locale-aware href
  const getLocalizedHref = (href: string) => {
    return locale === defaultLocale ? href : `/${locale}${href}`
  }

  // Helper to check if path is active (considering locale prefix)
  const isPathActive = (href: string) => {
    const localizedHref = getLocalizedHref(href)
    return pathname === localizedHref
  }

  // Helper to check if user can access route
  const canAccessRoute = (roles: UserRole[] | null) => {
    if (!roles) return true
    if (!user) return false
    return roles.includes(user.role)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-white transition-transform duration-200 dark:bg-slate-950 lg:translate-x-0 flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href={getLocalizedHref('/dashboard')} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">{tCommon('appName')}</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 h-0 px-4">
          <nav className="space-y-6 py-6">
            {navigationConfig.map((section) =>
              'items' in section && section.items ? (
                <div key={section.key}>
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(section.key)}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      if (!canAccessRoute(item.roles)) return null
                      const Icon = item.icon
                      const isActive = isPathActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={getLocalizedHref(item.href)}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {t(item.key)}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ) : (
                canAccessRoute(section.roles) && (
                  <div key={section.href}>
                    <Link
                      href={getLocalizedHref(section.href)}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isPathActive(section.href)
                          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                      )}
                    >
                      <section.icon className="h-4 w-4" />
                      {t(section.key)}
                    </Link>
                  </div>
                )
              )
            )}
          </nav>
        </ScrollArea>

        {/* User info section at the bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role || 'Role'}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

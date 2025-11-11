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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Locale, defaultLocale } from '@/lib/i18n/config'

interface SideNavProps {
  open: boolean
  onClose: () => void
}

const navigationConfig = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    key: 'userManagement',
    items: [
      { key: 'users', href: '/users', icon: Users },
      { key: 'roles', href: '/roles', icon: Users },
    ],
  },
  {
    key: 'content',
    items: [
      { key: 'products', href: '/products', icon: Package },
      { key: 'documents', href: '/documents', icon: FileText },
    ],
  },
  {
    key: 'analytics',
    items: [
      { key: 'reports', href: '/reports', icon: BarChart3 },
      { key: 'statistics', href: '/statistics', icon: BarChart3 },
    ],
  },
  { key: 'settings', href: '/settings', icon: Settings },
]

export function SideNav({ open, onClose }: SideNavProps) {
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = (params.locale as Locale) || defaultLocale

  // Helper to create locale-aware href
  const getLocalizedHref = (href: string) => {
    return locale === defaultLocale ? href : `/${locale}${href}`
  }

  // Helper to check if path is active (considering locale prefix)
  const isPathActive = (href: string) => {
    const localizedHref = getLocalizedHref(href)
    return pathname === localizedHref
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
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-white transition-transform duration-200 dark:bg-slate-950 lg:relative lg:translate-x-0',
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

        <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
          <nav className="space-y-6">
            {navigationConfig.map((section) =>
              'items' in section && section.items ? (
                <div key={section.key}>
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(section.key)}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
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
            )}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}

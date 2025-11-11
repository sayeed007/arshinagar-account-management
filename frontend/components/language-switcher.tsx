'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { locales, localeNames, defaultLocale, type Locale } from '@/lib/i18n/config'

function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations('common')
  const currentLocale = (params.locale as Locale) || defaultLocale

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return

    // Strip locale from current pathname to get the base path
    let basePath = pathname

    // Remove any locale prefix
    for (const locale of locales) {
      if (basePath.startsWith(`/${locale}/`) || basePath === `/${locale}`) {
        basePath = basePath.slice(`/${locale}`.length)
        break
      }
    }

    // Fallback to dashboard if no path
    if (!basePath) {
      basePath = '/dashboard'
    }

    // Build new path based on 'as-needed' locale prefix strategy
    const newPath = newLocale === defaultLocale
      ? basePath
      : `/${newLocale}${basePath}`

    // Set the NEXT_LOCALE cookie to persist locale preference
    setLocaleCookie(newLocale)

    // Use router.push with refresh to ensure middleware runs and locale context updates
    router.push(newPath)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? 'bg-slate-100 dark:bg-slate-800' : ''}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

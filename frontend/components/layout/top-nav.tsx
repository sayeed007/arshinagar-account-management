'use client'

import { Bell, Menu, User, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useAuth } from '@/lib/auth-context'

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const tCommon = useTranslations('common')
  const tNotifications = useTranslations('notifications')
  const tUser = useTranslations('user')
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="h-16 sticky top-0 z-40 border-b bg-white dark:bg-slate-950">
      <div className="flex h-16 items-center gap-4 px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold lg:hidden">{tCommon('appName')}</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>{tNotifications('title')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1 p-2">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="text-sm font-medium">{tNotifications('newMessage')}</p>
                  <p className="text-xs text-muted-foreground">
                    {tNotifications('messageFrom')}
                  </p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium">{user?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || 'Role'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
                  <Badge variant="outline" className="w-fit">
                    {user?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                {tCommon('profile')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon className="mr-2 h-4 w-4" />
                {tCommon('settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {tCommon('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

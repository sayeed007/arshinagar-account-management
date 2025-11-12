'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MapPin, ListTree, Grid3x3, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { type Locale, defaultLocale } from '@/lib/i18n/config'
import { landApi } from '@/lib/api'
import { showError } from '@/lib/toast'
import { getErrorMessage } from '@/lib/types'

interface LandStats {
  totalRSNumbers: number
  totalPlots: number
  availablePlots: number
  soldPlots: number
  totalArea: number
  availableArea: number
  soldArea: number
}

export default function LandInventoryPage() {
  const t = useTranslations('landInventory')
  const tCommon = useTranslations('common')
  const params = useParams()
  const locale = (params.locale as Locale) || defaultLocale
  const [stats, setStats] = useState<LandStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await landApi.getStats()
      setStats(data)
    } catch (error: unknown) {
      console.error('Failed to load land statistics:', error)
      showError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Helper to create locale-aware href
  const getLocalizedHref = (href: string) => {
    return locale === defaultLocale ? href : `/${locale}${href}`
  }

  // Helper to format area in acres
  const formatArea = (area: number) => {
    return area.toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>

      <Separator />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalRSNumbers')}
            </CardTitle>
            <ListTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats?.totalRSNumbers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.activeRecords')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalPlots')}
            </CardTitle>
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats?.totalPlots || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.allPlots')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.availableLand')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats?.availableArea ? formatArea(stats.availableArea) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.inAcres')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.soldLand')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats?.soldArea ? formatArea(stats.soldArea) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.inAcres')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections - Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* RS Numbers Section */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTree className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>{t('rsNumbers.title')}</CardTitle>
                  <CardDescription className="mt-1">
                    {t('rsNumbers.description')}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">{t('rsNumbers.badge')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('rsNumbers.info')}
            </p>

            <div className="flex flex-wrap gap-2">
              <Link href={getLocalizedHref('/land/rs-numbers')}>
                <Button variant="default">
                  <ListTree className="mr-2 h-4 w-4" />
                  {t('rsNumbers.viewAll')}
                </Button>
              </Link>
              <Link href={getLocalizedHref('/land/rs-numbers/new')}>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('rsNumbers.addNew')}
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-semibold">{t('rsNumbers.features')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('rsNumbers.feature1')}</li>
                <li>• {t('rsNumbers.feature2')}</li>
                <li>• {t('rsNumbers.feature3')}</li>
                <li>• {t('rsNumbers.feature4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Plots Section */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>{t('plots.title')}</CardTitle>
                  <CardDescription className="mt-1">
                    {t('plots.description')}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">{t('plots.badge')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('plots.info')}
            </p>

            <div className="flex flex-wrap gap-2">
              <Link href={getLocalizedHref('/land/plots')}>
                <Button variant="default">
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  {t('plots.viewAll')}
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-semibold">{t('plots.features')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('plots.feature1')}</li>
                <li>• {t('plots.feature2')}</li>
                <li>• {t('plots.feature3')}</li>
                <li>• {t('plots.feature4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">{t('info.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t('info.paragraph1')}</p>
          <p>{t('info.paragraph2')}</p>
          <div className="pt-2">
            <h5 className="font-semibold text-foreground mb-2">{t('info.workflowTitle')}</h5>
            <ol className="list-decimal list-inside space-y-1">
              <li>{t('info.step1')}</li>
              <li>{t('info.step2')}</li>
              <li>{t('info.step3')}</li>
              <li>{t('info.step4')}</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

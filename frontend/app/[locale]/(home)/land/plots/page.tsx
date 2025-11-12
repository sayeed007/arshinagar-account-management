'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { landApi, Plot, RSNumber, PlotStatus, Client } from '@/lib/api'
import { showSuccess, showError } from '@/lib/toast';
import { getErrorMessage } from '@/lib/types';
import { Grid3x3, MapPin, User, Calendar, Search, Filter, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type Locale, defaultLocale } from '@/lib/i18n/config'

export default function AllPlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [rsNumbers, setRSNumbers] = useState<Map<string, RSNumber>>(new Map())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const params = useParams()
  const locale = (params.locale as Locale) || defaultLocale

  // Helper to create locale-aware href
  const getLocalizedHref = (href: string) => {
    return locale === defaultLocale ? href : `/${locale}${href}`
  }

  useEffect(() => {
    loadPlots()
  }, [page, search, statusFilter])

  const loadPlots = async () => {
    try {
      setLoading(true)
      const response = await landApi.getAllPlots({
        page,
        limit: 20,
        status: statusFilter !== 'all' ? (statusFilter as PlotStatus) : undefined,
      })

      setPlots(response.data || [])
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages)
        setTotal(response.pagination.total)
      }

      // Load RS Number details for each plot
      const rsNumberIds = [...new Set(
        response.data?.map(p => typeof p.rsNumberId === 'string' ? p.rsNumberId : p.rsNumberId._id) || []
      )]
      const rsMap = new Map<string, RSNumber>()

      for (const rsId of rsNumberIds) {
        try {
          const rs = await landApi.rsNumbers.getById(rsId)
          if (rs.data) {
            rsMap.set(rsId, rs.data)
          }
        } catch (error) {
          console.error(`Failed to load RS Number ${rsId}:`, error)
        }
      }

      setRSNumbers(rsMap)
    } catch (error: unknown) {
      console.error('Failed to load plots:', error)
      showError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadPlots()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatArea = (area: number, unit: string) => {
    return `${area.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US')} ${unit}`
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href={getLocalizedHref('/land')} className="hover:text-foreground">
            Plot Inventory
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">All Plots</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Grid3x3 className="h-8 w-8" />
          All Plot Plots
        </h1>
        <p className="text-muted-foreground mt-2">
          View all plots across all RS Numbers with search and filtering
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search by Plot Number or Client
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Enter plot number or client name..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-900 dark:border-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setPage(1)
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{plots.length}</span> of{' '}
          <span className="font-medium text-foreground">{total}</span> plots
        </p>
      </div>

      {/* Plots Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading plots...</p>
        </div>
      ) : plots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Grid3x3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Plots Found</h3>
            <p className="text-muted-foreground">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No plots have been created yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plots.map((plot) => {
            const rsId = typeof plot.rsNumberId === 'string' ? plot.rsNumberId : plot.rsNumberId._id
            const rsNumber = rsNumbers.get(rsId)
            return (
              <Link key={plot._id} href={getLocalizedHref(`/land/plots/${plot._id}`)}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Grid3x3 className="h-5 w-5" />
                          {plot.plotNumber}
                        </CardTitle>
                        {rsNumber && (
                          <CardDescription className="mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            RS#{rsNumber.rsNumber} - {rsNumber.projectName}
                          </CardDescription>
                        )}
                      </div>
                      <Badge className={getStatusColor(plot.status)}>
                        {plot.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Area */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Area:</span>
                      <span className="font-medium">
                        {formatArea(plot.area, plot.unitType)}
                      </span>
                    </div>

                    {/* Client */}
                    {plot.clientId && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Client:
                        </span>
                        <span className="font-medium truncate max-w-[150px]">
                          {typeof plot.clientId === 'string' ? plot.clientId : plot.clientId.name}
                        </span>
                      </div>
                    )}

                    {/* Sale Date */}
                    {plot.saleDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sale Date:
                        </span>
                        <span className="font-medium">
                          {new Date(plot.saleDate).toLocaleDateString(
                            locale === 'bn' ? 'bn-BD' : 'en-US'
                          )}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    {rsNumber?.location && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {rsNumber.location}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

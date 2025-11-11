import { AppShell } from '@/components/layout/app-shell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // TODO: Add ProtectedRoute wrapper when authentication is implemented
    <AppShell>{children}</AppShell>
  )
}

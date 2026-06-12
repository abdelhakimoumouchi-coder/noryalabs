import type { Metadata } from 'next'
import AdminShell from './AdminShell'

export const metadata: Metadata = {
  title: 'Admin - Store DZ',
  robots: 'noindex, nofollow',
  alternates: {
    canonical: 'https://storedzone.store/admin',
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}

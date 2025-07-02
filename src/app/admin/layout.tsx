'use client'

import { AdminHeader } from '@/components'

import styles from './admin.module.scss'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Usunięto sprawdzanie sesji, ponieważ jest już obsługiwane przez middleware

  return (
    <div className={styles.adminLayout}>
      <AdminHeader />
      <main className={styles.adminMain}>{children}</main>
    </div>
  )
}

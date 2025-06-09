'use client'

import { AdminHeader } from '@/components/Header/AdminHeader'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import styles from './admin.module.scss'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()

  useEffect(() => {
    // Sprawdzenie sesji administratora po stronie klienta
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          // Jeśli nie ma ważnej sesji, przekieruj do strony logowania
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Błąd sprawdzania sesji:', error)
        router.push('/admin/login')
      }
    }

    checkSession()
  }, [router])

  return (
    <div className={styles.adminLayout}>
      <AdminHeader />
      <main className={styles.adminMain}>{children}</main>
    </div>
  )
}

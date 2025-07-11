import { NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/admin-session'

export async function GET() {
  try {
    const isValid = await validateSession()
    
    if (isValid) {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch (error) {
    console.error('Błąd podczas sprawdzania sesji:', error)
    return NextResponse.json({ authenticated: false, error: 'Błąd weryfikacji sesji' }, { status: 500 })
  }
}

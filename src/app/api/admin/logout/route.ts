import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth/admin-session'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Błąd podczas wylogowywania:', error)
    return NextResponse.json({ success: false, error: 'Błąd wylogowania' }, { status: 500 })
  }
}

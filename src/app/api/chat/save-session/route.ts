import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ChatMessageData {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface SaveSessionRequest {
  sessionId: string
  messages: ChatMessageData[]
  userAgent?: string
  ipAddress?: string
  userName?: string
  userEmail?: string
  userPhone?: string
  endSession?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages, userAgent, ipAddress, userName, userEmail, userPhone, endSession }: SaveSessionRequest = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId is required' },
        { status: 400 }
      )
    }

    // Sprawdź czy sesja już istnieje
    let session = await prisma.chatSession.findUnique({
      where: { sessionId }
    })

    if (!session) {
      // Utwórz nową sesję z pustą tablicą wiadomości
      session = await prisma.chatSession.create({
        data: {
          sessionId,
          userAgent: userAgent || null,
          ipAddress: ipAddress || null,
          userName: userName || null,
          userEmail: userEmail || null,
          userPhone: userPhone || null,
          messages: messages || []
        }
      })
      console.log(`📝 [chat-session] Utworzono nową sesję: ${sessionId}`)
    } else {
      // Aktualizuj istniejącą sesję
      const currentMessages = Array.isArray(session.messages) ? session.messages as ChatMessageData[] : []
      const newMessages = messages || []
      const allMessages = [...currentMessages, ...newMessages]
      
      const updateData: {
        messages: any
        userName?: string
        userEmail?: string
        userPhone?: string
        endedAt?: Date
      } = {
        messages: allMessages as any
      }
      
      // Aktualizuj dane kontaktowe jeśli zostały podane
      if (userName) updateData.userName = userName
      if (userEmail) updateData.userEmail = userEmail
      if (userPhone) updateData.userPhone = userPhone
      if (endSession) updateData.endedAt = new Date()
      
      session = await prisma.chatSession.update({
        where: { id: session.id },
        data: updateData
      })
      
      console.log(`📝 [chat-session] Zaktualizowano sesję: ${sessionId} (${newMessages.length} nowych wiadomości)`)
    }

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      messagesCount: Array.isArray(session.messages) ? (session.messages as any[]).length : 0
    })

  } catch (error) {
    console.error('💥 [chat-session] Błąd zapisu sesji:', error)
    return NextResponse.json(
      { error: 'Błąd zapisu sesji' },
      { status: 500 }
    )
  }
}

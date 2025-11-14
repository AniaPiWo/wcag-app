import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      select: {
        id: true,
        sessionId: true,
        userName: true,
        userEmail: true,
        userPhone: true,
        userAgent: true,
        ipAddress: true,
        startedAt: true,
        endedAt: true,
        messages: true
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sesja czatu nie została znaleziona' },
        { status: 404 }
      );
    }

    // Przetwarzanie wiadomości
    const messages = Array.isArray(session.messages) ? session.messages : [];
    const processedMessages = messages.map((msg, index) => {
      if (typeof msg === 'object' && msg !== null) {
        return {
          id: index,
          content: 'content' in msg && typeof msg.content === 'string' ? msg.content : 'Brak treści',
          role: 'role' in msg && typeof msg.role === 'string' ? msg.role : 'unknown',
          timestamp: 'timestamp' in msg ? msg.timestamp : session.startedAt,
          ...msg
        };
      }
      return {
        id: index,
        content: String(msg),
        role: 'unknown',
        timestamp: session.startedAt
      };
    });

    const sessionWithProcessedMessages = {
      ...session,
      messages: processedMessages,
      messageCount: processedMessages.length,
      duration: session.endedAt 
        ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60)
        : null
    };

    return NextResponse.json({ session: sessionWithProcessedMessages });

  } catch (error) {
    console.error('Błąd podczas pobierania sesji czatu:', error);
    return NextResponse.json(
      { error: 'Błąd podczas pobierania sesji czatu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

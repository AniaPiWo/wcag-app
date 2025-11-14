import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Budowanie warunków wyszukiwania
    const whereCondition = search ? {
      OR: [
        { userName: { contains: search, mode: 'insensitive' as const } },
        { userEmail: { contains: search, mode: 'insensitive' as const } },
        { sessionId: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Pobieranie sesji z paginacją
    const [sessions, totalCount] = await Promise.all([
      prisma.chatSession.findMany({
        where: whereCondition,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.chatSession.count({ where: whereCondition })
    ]);

    // Przetwarzanie danych - liczenie wiadomości
    const processedSessions = sessions.map(session => {
      const messages = Array.isArray(session.messages) ? session.messages : [];
      const messageCount = messages.length;
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

      return {
        ...session,
        messageCount,
        lastMessage: lastMessage ? {
          content: typeof lastMessage === 'object' && lastMessage !== null && 'content' in lastMessage && typeof lastMessage.content === 'string'
            ? lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : '')
            : 'Brak treści',
          timestamp: typeof lastMessage === 'object' && lastMessage !== null && 'timestamp' in lastMessage 
            ? lastMessage.timestamp 
            : session.startedAt
        } : null
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      sessions: processedSessions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

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

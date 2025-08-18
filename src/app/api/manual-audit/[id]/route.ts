import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/manual-audit/[id] - Pobieranie pojedynczego audytu manualnego
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Brak ID audytu' }, { status: 400 });
    }

    // Pobieranie audytu z bazy danych
    const audit = await prisma.auditRequest.findUnique({
      where: { id, auditType: 'manual' },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audyt nie został znaleziony' }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Błąd podczas pobierania audytu manualnego:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania audytu manualnego' },
      { status: 500 }
    );
  }
}

// PUT /api/manual-audit/[id] - Aktualizacja audytu manualnego
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Brak ID audytu' }, { status: 400 });
    }

    // Sprawdzenie czy audyt istnieje
    const existingAudit = await prisma.auditRequest.findUnique({
      where: { id, auditType: 'manual' },
    });

    if (!existingAudit) {
      return NextResponse.json({ error: 'Audyt nie został znaleziony' }, { status: 404 });
    }

    // Pobranie danych z żądania
    const data = await request.json();
    const { url, basicAudit, intermediateAudit, advancedAudit, selectedLevels } = data;

    if (!url) {
      return NextResponse.json({ error: 'URL jest wymagany' }, { status: 400 });
    }

    // Aktualizacja audytu w bazie danych
    const updatedAudit = await prisma.auditRequest.update({
      where: { id },
      data: {
        url,
        basicAudit,
        intermediateAudit,
        advancedAudit,
        selectedLevels, // Używamy wartości bez ponownego stringyfikowania
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedAudit);
  } catch (error) {
    console.error('Błąd podczas aktualizacji audytu manualnego:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji audytu manualnego' },
      { status: 500 }
    );
  }
}

// PATCH /api/manual-audit/[id] - Aktualizacja pojedynczych pól audytu manualnego
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Brak ID audytu' }, { status: 400 });
    }

    // Sprawdzenie czy audyt istnieje
    const existingAudit = await prisma.auditRequest.findUnique({
      where: { id, auditType: 'manual' },
    });

    if (!existingAudit) {
      return NextResponse.json({ error: 'Audyt nie został znaleziony' }, { status: 404 });
    }

    // Pobranie danych z żądania
    const data = await request.json();
    console.log('PATCH data:', data);

    // Aktualizacja tylko określonych pól
    const updatedAudit = await prisma.auditRequest.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedAudit);
  } catch (error) {
    console.error('Błąd podczas aktualizacji pól audytu manualnego:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji pól audytu manualnego' },
      { status: 500 }
    );
  }
}

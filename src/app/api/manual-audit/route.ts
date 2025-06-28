import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { url, basicAudit, intermediateAudit, advancedAudit, selectedLevels } = data;

    if (!url) {
      return NextResponse.json({ error: 'URL jest wymagany' }, { status: 400 });
    }
    
    // Zapisz audyt w bazie danych używając dedykowanych pól dla audytu manualnego
    const audit = await prisma.auditRequest.create({
      data: {
        url,
        status: 'completed',
        completedAt: new Date(),
        auditType: 'manual',
        // Zapisz dane audytu w odpowiednich polach
        basicAudit: basicAudit,
        intermediateAudit: intermediateAudit,
        advancedAudit: advancedAudit,
        selectedLevels: JSON.stringify(selectedLevels),
      },
    });

    return NextResponse.json({ 
      success: true, 
      id: audit.id,
      message: 'Audyt manualny został zapisany pomyślnie' 
    });
  } catch (error) {
    console.error('Błąd podczas zapisywania audytu manualnego:', error);
    return NextResponse.json({ 
      error: 'Wystąpił błąd podczas zapisywania audytu' 
    }, { status: 500 });
  }
}

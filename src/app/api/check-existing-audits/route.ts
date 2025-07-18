import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/db/audit-service';

export async function GET(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    // Pobierz URL z parametrów zapytania
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'Brak parametru URL' },
        { status: 400, headers }
      );
    }

    // Wyszukaj istniejące audyty dla podanego URL
    const existingAudits = await auditService.findAuditRequestsByUrl(url);
    
    // Zwróć znalezione audyty
    return NextResponse.json({
      success: true,
      existingAudits,
      count: existingAudits.length
    }, { headers });
  } catch (error) {
    console.error('Błąd podczas wyszukiwania istniejących audytów:', error);
    return NextResponse.json(
      { 
        error: 'Wystąpił błąd podczas wyszukiwania istniejących audytów', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500, headers }
    );
  }
}

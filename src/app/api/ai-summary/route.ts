import { NextRequest, NextResponse } from 'next/server';
import { generateManualAuditSummary } from '@/lib/ai/ai-summary';

export async function POST(request: NextRequest) {
  try {
    const { auditData, level, selectedLevels } = await request.json();
    
    if (!auditData || !level) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Use the dedicated function from ai-summary.ts
    // Pass selectedLevels if available for consolidated reports
    const aiSummary = await generateManualAuditSummary(auditData, level, selectedLevels);
    
    return NextResponse.json({ summary: aiSummary });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    );
  }
}

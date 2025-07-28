import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const { auditId, pdfData } = await request.json();

    if (!auditId || !pdfData) {
      return NextResponse.json(
        { error: 'Missing required fields: auditId and pdfData' },
        { status: 400 }
      );
    }

    // Update the audit record with the PDF data
    // Use type assertion to work around schema update issues
    const updatedAudit = await prisma.auditRequest.update({
      where: {
        id: auditId
      },
      data: {
        pdfAuditData: pdfData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'PDF audit data saved successfully',
      auditId: updatedAudit.id
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('Error saving PDF audit data:');
    console.error('Message:', errorMsg);
    console.error('Stack:', errorStack);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    if (error instanceof Error && (error.message.includes('Unknown field') || error.message.includes('pdfAuditData'))) {
      // Handle the case where pdfAuditData field doesn't exist yet (migration not completed)
      console.log('pdfAuditData field not available, trying to save to clientReadyAudit instead');
      
      try {
        const { auditId, pdfData } = await request.json();
        
        // Fall back to saving in clientReadyAudit field with a marker
        const updatedAudit = await prisma.auditRequest.update({
          where: {
            id: auditId
          },
          data: {
            clientReadyAudit: JSON.stringify({
              pdfData: pdfData,
              timestamp: new Date().toISOString(),
              isPdfData: true
            }),
            updatedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'PDF audit data saved as fallback',
          auditId: updatedAudit.id
        });
      } catch (fallbackError) {
        console.error('Error in fallback save:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to save PDF data, even with fallback method' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

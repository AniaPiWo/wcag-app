import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { auditId, clientReadyAudit } = await request.json();

    if (!auditId || !clientReadyAudit) {
      return NextResponse.json(
        { error: 'Missing required fields: auditId and clientReadyAudit' },
        { status: 400 }
      );
    }

    // Update the audit record with the client-ready audit data
    const updatedAudit = await prisma.auditRequest.update({
      where: {
        id: auditId
      },
      data: {
        clientReadyAudit: clientReadyAudit,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Client-ready audit saved successfully',
      auditId: updatedAudit.id
    });

  } catch (error) {
    console.error('Error saving client-ready audit:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

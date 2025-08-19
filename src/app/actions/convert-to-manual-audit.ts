'use server'

import { prisma } from '@/lib/prisma';

/**
 * Converts an automatic audit to a manual audit and returns the ID of the new manual audit
 */
export async function convertToManualAudit(autoAuditId: string) {
  try {
    // Fetch the original auto audit
    const autoAudit = await prisma.auditRequest.findUnique({
      where: {
        id: autoAuditId
      }
    });

    if (!autoAudit) {
      throw new Error('Auto audit not found');
    }

    // Create a new manual audit based on the auto audit data
    const manualAudit = await prisma.auditRequest.create({
      data: {
        url: autoAudit.url || '',
        name: `Manual from auto: ${autoAudit.url}`,
        email: autoAudit.email || '',
        auditType: 'manual',
        selectedLevels: JSON.stringify([
          { id: 'basic', label: 'Podstawowy' },
          { id: 'intermediate', label: 'Średni' },
          { id: 'advanced', label: 'Zaawansowany' }
        ]),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Copy any AI analysis or other data from auto audit that might be useful
        aiAnalysis: autoAudit.aiAnalysis,
        violations: autoAudit.violations
      },
    });

    // Return the ID of the new manual audit
    return { id: manualAudit.id };
  } catch (error) {
    console.error('Error converting auto audit to manual:', error);
    throw new Error('Failed to convert automatic audit to manual');
  }
}

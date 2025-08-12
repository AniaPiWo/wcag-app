'use server'

import { prisma } from '@/lib/prisma';

/**
 * Creates a new empty manual audit record and redirects to the edit page
 */
export async function createEmptyManualAudit() {
  try {
    // Create a new audit record with minimal required fields
    const newAudit = await prisma.auditRequest.create({
      data: {
        url: '',
        name: 'Nowy audyt manualny',
        email: '',
        auditType: 'manual',
        selectedLevels: JSON.stringify([]), // Empty levels array
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Return the ID of the new audit
    return { id: newAudit.id };
  } catch (error) {
    console.error('Błąd podczas tworzenia nowego audytu manualnego:', error);
    throw new Error('Wystąpił błąd podczas tworzenia nowego audytu manualnego');
  }
}

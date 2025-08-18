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
        selectedLevels: JSON.stringify([
          { id: 'basic', label: 'Podstawowy' },
          { id: 'intermediate', label: 'Średni' },
          { id: 'advanced', label: 'Zaawansowany' }
        ]), // Initialize with all three levels selected by default
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

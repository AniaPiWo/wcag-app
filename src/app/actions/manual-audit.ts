'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Interfejs dla danych audytu
interface AuditItemData {
  itemId: number;
  evaluation: string;
  notes: string;
}

interface UpdateAuditData {
  basicAudit?: AuditItemData[];
  intermediateAudit?: AuditItemData[];
  advancedAudit?: AuditItemData[];
}

// Pobieranie pojedynczego audytu manualnego
export async function getManualAudit(id: string) {
  try {
    if (!id) {
      throw new Error('Brak ID audytu');
    }

    // Pobieranie audytu z bazy danych
    const audit = await prisma.auditRequest.findUnique({
      where: { id, auditType: 'manual' },
    });

    if (!audit) {
      throw new Error('Audyt nie został znaleziony');
    }

    return audit;
  } catch (error) {
    console.error('Błąd podczas pobierania audytu manualnego:', error);
    throw new Error('Wystąpił błąd podczas pobierania audytu manualnego');
  }
}

// Aktualizacja audytu manualnego
export async function updateManualAudit(id: string, data: UpdateAuditData) {
  try {
    if (!id) {
      throw new Error('Brak ID audytu');
    }

    // Sprawdzenie czy audyt istnieje
    const existingAudit = await prisma.auditRequest.findUnique({
      where: { id, auditType: 'manual' },
    });

    if (!existingAudit) {
      throw new Error('Audyt nie został znaleziony');
    }

    // Przygotowanie danych do aktualizacji
    const updateData: {
      updatedAt: Date;
      basicAudit?: string;
      intermediateAudit?: string;
      advancedAudit?: string;
    } = {
      updatedAt: new Date(),
    };

    // Dodanie danych audytu, jeśli zostały przekazane
    if (data.basicAudit) {
      updateData.basicAudit = JSON.stringify(data.basicAudit);
    }
    if (data.intermediateAudit) {
      updateData.intermediateAudit = JSON.stringify(data.intermediateAudit);
    }
    if (data.advancedAudit) {
      updateData.advancedAudit = JSON.stringify(data.advancedAudit);
    }

    // Aktualizacja audytu w bazie danych
    const updatedAudit = await prisma.auditRequest.update({
      where: { id },
      data: updateData,
    });

    // Odświeżenie ścieżki po aktualizacji
    revalidatePath(`/admin/manual-audits/edit/${id}`);

    return updatedAudit;
  } catch (error) {
    console.error('Błąd podczas aktualizacji audytu manualnego:', error);
    throw new Error('Wystąpił błąd podczas aktualizacji audytu manualnego');
  }
}

// Funkcja do aktualizacji pojedynczego elementu audytu
export async function updateAuditItem(
  id: string,
  level: 'basic' | 'intermediate' | 'advanced',
  itemId: number,
  field: 'evaluation' | 'notes',
  value: string
) {
  try {
    // Pobierz aktualny audyt
    const audit = await getManualAudit(id);
    
    // Przygotuj dane do aktualizacji
    let auditData: AuditItemData[] = [];
    let auditField: string;
    
    // Wybierz odpowiednie pole w zależności od poziomu
    if (level === 'basic') {
      auditField = 'basicAudit';
      auditData = audit.basicAudit ? JSON.parse(audit.basicAudit) : [];
    } else if (level === 'intermediate') {
      auditField = 'intermediateAudit';
      auditData = audit.intermediateAudit ? JSON.parse(audit.intermediateAudit) : [];
    } else if (level === 'advanced') {
      auditField = 'advancedAudit';
      auditData = audit.advancedAudit ? JSON.parse(audit.advancedAudit) : [];
    } else {
      throw new Error('Nieprawidłowy poziom audytu');
    }
    
    // Znajdź i zaktualizuj element lub dodaj nowy
    const itemIndex = auditData.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1) {
      // Jeśli element nie istnieje, dodaj nowy
      const newItem: AuditItemData = {
        itemId,
        evaluation: field === 'evaluation' ? value : '',
        notes: field === 'notes' ? value : ''
      };
      auditData.push(newItem);
    } else {
      // Jeśli element istnieje, zaktualizuj go
      auditData[itemIndex] = { ...auditData[itemIndex], [field]: value };
    }
    
    // Przygotuj dane do aktualizacji w bazie
    const updateData: {
      [key: string]: string | Date;
    } = {
      [auditField]: JSON.stringify(auditData),
      updatedAt: new Date()
    };
    
    // Aktualizuj w bazie danych
    const updatedAudit = await prisma.auditRequest.update({
      where: { id },
      data: updateData
    });
    
    // Odśwież stronę
    revalidatePath(`/admin/manual-audits/edit/${id}`);
    
    return updatedAudit;
  } catch (error) {
    console.error('Błąd podczas aktualizacji elementu audytu:', error);
    throw new Error('Wystąpił błąd podczas aktualizacji elementu audytu');
  }
}

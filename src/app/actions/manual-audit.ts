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
  basicAuditAISummary?: string;
  intermediateAuditAISummary?: string;
  advancedAuditAISummary?: string;
  consolidatedAuditAISummary?: string;
  readyMadeAudit?: string;
  aiAnalysis?: string; // Pole używane do przechowywania danych audytu automatycznego
  automatedAuditId?: string;
  automatedAuditUrl?: string;
  automatedAuditDate?: string;
  automatedAuditData?: string;
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
      basicAuditAISummary?: string;
      intermediateAuditAISummary?: string;
      advancedAuditAISummary?: string;
      consolidatedAuditAISummary?: string;
      aiAnalysis?: string;
      readyMadeAudit?: string;
      automatedAuditId?: string;
      automatedAuditUrl?: string;
      automatedAuditDate?: string;
      automatedAuditData?: string;
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
    
    // Dodanie podsumowań AI, jeśli zostały przekazane
    if (data.basicAuditAISummary) {
      updateData.basicAuditAISummary = data.basicAuditAISummary;
    }
    if (data.intermediateAuditAISummary) {
      updateData.intermediateAuditAISummary = data.intermediateAuditAISummary;
    }
    if (data.advancedAuditAISummary) {
      updateData.advancedAuditAISummary = data.advancedAuditAISummary;
    }
    if (data.consolidatedAuditAISummary) {
      updateData.consolidatedAuditAISummary = data.consolidatedAuditAISummary;
    }
    if (data.readyMadeAudit !== undefined) {
      updateData.readyMadeAudit = data.readyMadeAudit;
    }
    
    // Dodanie danych audytu automatycznego, jeśli zostały przekazane
    if (data.automatedAuditId) {
      updateData.automatedAuditId = data.automatedAuditId;
    }
    if (data.automatedAuditUrl) {
      updateData.automatedAuditUrl = data.automatedAuditUrl;
    }
    if (data.automatedAuditDate) {
      updateData.automatedAuditDate = data.automatedAuditDate;
    }
    if (data.automatedAuditData) {
      updateData.automatedAuditData = data.automatedAuditData;
    }

    try {
      // Aktualizacja audytu w bazie danych
      // Filtrujemy pola updateData, aby uwzględnić tylko te, które faktycznie istnieją w bazie
      const safeUpdateData: {
        updatedAt: Date;
        basicAudit?: string;
        intermediateAudit?: string;
        advancedAudit?: string;
        basicAuditAISummary?: string;
        intermediateAuditAISummary?: string;
        advancedAuditAISummary?: string;
        consolidatedAuditAISummary?: string;
        aiAnalysis?: string;
        readyMadeAudit?: string;
      } = { updatedAt: updateData.updatedAt };
      
      // Standardowe pola
      if ('basicAudit' in updateData) safeUpdateData.basicAudit = updateData.basicAudit;
      if ('intermediateAudit' in updateData) safeUpdateData.intermediateAudit = updateData.intermediateAudit;
      if ('advancedAudit' in updateData) safeUpdateData.advancedAudit = updateData.advancedAudit;
      if ('basicAuditAISummary' in updateData) safeUpdateData.basicAuditAISummary = updateData.basicAuditAISummary;
      if ('intermediateAuditAISummary' in updateData) safeUpdateData.intermediateAuditAISummary = updateData.intermediateAuditAISummary;
      if ('advancedAuditAISummary' in updateData) safeUpdateData.advancedAuditAISummary = updateData.advancedAuditAISummary;
      if ('consolidatedAuditAISummary' in updateData) safeUpdateData.consolidatedAuditAISummary = updateData.consolidatedAuditAISummary;
      if ('aiAnalysis' in updateData) safeUpdateData.aiAnalysis = updateData.aiAnalysis;
      if ('readyMadeAudit' in updateData) safeUpdateData.readyMadeAudit = updateData.readyMadeAudit;
      
      // Aktualizacja audytu z bezpiecznymi polami
      const updatedAudit = await prisma.auditRequest.update({
        where: { id },
        data: safeUpdateData,
      });
      
      // Odświeżenie ścieżki po aktualizacji
      revalidatePath(`/admin/manual-audits/edit/${id}`);
      
      return updatedAudit;
    } catch (updateError) {
      console.error('Błąd podczas aktualizacji audytu manualnego (standardowe pola):', updateError);
      throw new Error('Wystąpił błąd podczas aktualizacji audytu manualnego');
    }
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

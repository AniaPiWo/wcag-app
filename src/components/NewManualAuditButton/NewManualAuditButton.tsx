'use client'

import { Button } from '@/components/atoms/Button/Button';
import { createEmptyManualAudit } from '@/app/actions/create-manual-audit';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NewManualAuditButtonProps {
  className?: string;
}

export const NewManualAuditButton: React.FC<NewManualAuditButtonProps> = ({ className }) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAudit = async () => {
    try {
      setIsCreating(true);
      const result = await createEmptyManualAudit();
      if (result?.id) {
        // Redirect to the edit page with the new audit ID
        router.push(`/admin/manual-audits/edit/${result.id}`);
      } else {
        console.error('Nie udało się utworzyć nowego audytu');
        alert('Wystąpił błąd podczas tworzenia nowego audytu');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia nowego audytu:', error);
      alert('Wystąpił błąd podczas tworzenia nowego audytu');
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateAudit}
      className={className}
      disabled={isCreating}
    >
      {isCreating ? 'Tworzenie...' : 'Nowy audyt manualny'}
    </Button>
  );
};

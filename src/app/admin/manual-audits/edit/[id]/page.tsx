import { ManualAuditForm } from '@/components/ManualAuditForm/ManualAuditForm';
import styles from "./page.module.scss"
import { GoBackBtn } from '@/components/GoBackBtn/GoBackBtn';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  return (
    <div className={styles.page}>
      <GoBackBtn href="/admin" text="Powrót" />
      <ManualAuditForm id={id} />
    </div>
  );
}
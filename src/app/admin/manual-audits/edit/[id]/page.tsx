import { ManualAuditForm } from '@/components';
import styles from "./page.module.scss"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  return (
    <div className={styles.page}>
      <ManualAuditForm id={id} />
    </div>
  );
}
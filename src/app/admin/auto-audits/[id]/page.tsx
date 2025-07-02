/* eslint-disable react-hooks/rules-of-hooks */
import AuditDetails from '@/components/AuditDetails/AuditDetails';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  
  return <AuditDetails id={id} />;
}

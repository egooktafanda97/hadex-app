import { requireUser } from '@/lib/dal';
import { RoleDashboard } from '@/components/role-dashboard';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const u = await requireUser(['customer']);
  return <RoleDashboard role='customer' userId={u.id} name={u.name} />;
}

import { requireUser } from '@/lib/dal';
import { ProfileForm } from '@/components/profile-form';

export default async function Page() {
  const user = await requireUser(['customer']);
  return (
    <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ''} />
  );
}

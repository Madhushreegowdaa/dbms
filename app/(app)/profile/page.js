import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from '../../../components/ProfileForm';

export const metadata = { title: 'My Profile – SkillPath' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  return <ProfileForm student={student} userEmail={user.email} userId={user.id} />;
}

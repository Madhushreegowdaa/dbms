import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from '../../../components/ProfileForm';

export const metadata = { title: 'My Profile – SkillPath' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('student_id, name, email, branch, year, career_goal')
    .eq('student_id', user.id)
    .maybeSingle();
  if (studentError) throw new Error(`Could not load student profile: ${studentError.message}`);

  return <ProfileForm student={student} userEmail={user.email} userId={user.id} />;
}

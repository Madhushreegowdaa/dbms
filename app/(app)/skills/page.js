import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import SkillsManager from '../../../components/SkillsManager';

export const metadata = { title: 'My Skills – SkillPath' };

export default async function SkillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get student record
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  // Get all available skills
  const { data: allSkills } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('skill_name');

  // Get student's current skills
  let studentSkills = [];
  if (student) {
    const { data } = await supabase
      .from('student_skills')
      .select('skill_id, proficiency, created_at')
      .eq('student_id', student.id);
    studentSkills = data || [];
  }

  return (
    <SkillsManager
      allSkills={allSkills || []}
      studentSkills={studentSkills}
      studentId={student?.id || null}
      hasProfile={!!student}
    />
  );
}

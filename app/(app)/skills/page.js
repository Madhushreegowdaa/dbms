import { createClient, getAuthenticatedUser } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import SkillsManager from '../../../components/SkillsManager';

export const metadata = { title: 'My Skills – SkillPath' };

export default async function SkillsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  const [
    { data: student, error: studentError },
    { data: allSkills, error: skillsError },
  ] = await Promise.all([
    supabase
      .from('students')
      .select('student_id')
      .eq('student_id', user.id)
      .maybeSingle(),
    supabase
      .from('skills')
      .select('skill_id, skill_name, category')
      .order('category')
      .order('skill_name'),
  ]);
  if (studentError) throw new Error(`Could not load student profile: ${studentError.message}`);
  if (skillsError) throw new Error(`Could not load skills catalog: ${skillsError.message}`);

  // Get student's current skills
  let studentSkills = [];
  if (student) {
    const { data, error: studentSkillsError } = await supabase
      .from('student_skills')
      .select('skill_id, proficiency_level')
      .eq('student_id', student.student_id);
    if (studentSkillsError) throw new Error(`Could not load your skills: ${studentSkillsError.message}`);
    studentSkills = data;
  }

  return (
    <SkillsManager
      allSkills={allSkills}
      studentSkills={studentSkills}
      studentId={student?.student_id || null}
      hasProfile={!!student}
    />
  );
}

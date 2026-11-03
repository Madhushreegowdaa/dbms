import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import DashboardClient from './DashboardClient';

export const metadata = { title: 'Dashboard – SkillPath' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student } = await supabase
    .from('students').select('*').eq('auth_user_id', user.id).single();

  let skills = [];
  if (student) {
    const { data } = await supabase
      .from('student_skills')
      .select('proficiency, created_at, skills(skill_name, category)')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });
    skills = data || [];
  }

  const totalSkills       = skills.length;
  const beginnerCount     = skills.filter(s => s.proficiency === 'Beginner').length;
  const intermediateCount = skills.filter(s => s.proficiency === 'Intermediate').length;
  const advancedCount     = skills.filter(s => s.proficiency === 'Advanced').length;
  const recentSkills      = skills.slice(0, 5);

  const fields = ['full_name','college','branch','academic_year','career_goal','bio'];
  const filled = student ? fields.filter(f => student[f]).length : 0;
  const completion = Math.round((filled / fields.length) * 100);
  const displayName = student?.full_name || user.email.split('@')[0];

  return (
    <DashboardClient
      displayName={displayName}
      completion={completion}
      totalSkills={totalSkills}
      beginnerCount={beginnerCount}
      intermediateCount={intermediateCount}
      advancedCount={advancedCount}
      recentSkills={recentSkills}
      careerGoal={student?.career_goal || null}
      college={student?.college || null}
      avatarUrl={student?.avatar_url || null}
    />
  );
}

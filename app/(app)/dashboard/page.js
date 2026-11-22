import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import DashboardClient from './DashboardClient';

export const metadata = { title: 'Dashboard – SkillPath' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('student_id, name, email, branch, year, career_goal')
    .eq('student_id', user.id)
    .maybeSingle();
  if (studentError) throw new Error(`Could not load student profile: ${studentError.message}`);

  let skills = [];
  let recommendationCount = 0;
  let courseDataStatus = student ? 'unavailable' : 'profile-missing';
  if (student) {
    const { data, error: skillsError } = await supabase
      .from('student_skills')
      .select('skill_id, proficiency_level, skills(skill_name, category)')
      .eq('student_id', student.student_id)
      .order('skill_id');
    if (skillsError) throw new Error(`Could not load your skills: ${skillsError.message}`);
    skills = data;

    const { count, error: recommendationsError } = await supabase
      .from('recommendations')
      .select('recommendation_id', { count: 'exact', head: true })
      .eq('student_id', student.student_id);
    if (recommendationsError) {
      courseDataStatus = ['42P01', 'PGRST205'].includes(recommendationsError.code)
        ? 'migration-required'
        : 'error';
    } else {
      recommendationCount = count || 0;
      courseDataStatus = 'ready';
    }
  }

  const totalSkills       = skills.length;
  const beginnerCount     = skills.filter(s => s.proficiency_level === 'Beginner').length;
  const intermediateCount = skills.filter(s => s.proficiency_level === 'Intermediate').length;
  const advancedCount     = skills.filter(s => s.proficiency_level === 'Advanced').length;
  const studentSkills     = skills.slice(0, 5);

  const fields = ['name','branch','year','career_goal'];
  const filled = student ? fields.filter(f => student[f]).length : 0;
  const completion = Math.round((filled / fields.length) * 100);
  const displayName = student?.name || user.email.split('@')[0];

  return (
    <DashboardClient
      displayName={displayName}
      completion={completion}
      totalSkills={totalSkills}
      beginnerCount={beginnerCount}
      intermediateCount={intermediateCount}
      advancedCount={advancedCount}
      studentSkills={studentSkills}
      recommendationCount={recommendationCount}
      courseDataStatus={courseDataStatus}
      careerGoal={student?.career_goal || null}
      branch={student?.branch || null}
    />
  );
}

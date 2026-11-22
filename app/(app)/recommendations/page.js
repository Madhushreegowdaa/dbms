import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import styles from './recommendations.module.css';

export const metadata = { title: 'Course Recommendations – SkillPath' };

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('student_id, career_goal')
    .eq('student_id', user.id)
    .maybeSingle();

  if (studentError) {
    return <p className={styles.notice}>We could not load your student profile. Please try again.</p>;
  }
  if (!student) {
    return (
      <section className={styles.empty}>
        <h1>Complete your profile to get recommendations</h1>
        <p>Add your career goal and skills so the database can find courses that fit.</p>
        <Link href="/profile" className="btn btn-primary">Create your profile</Link>
      </section>
    );
  }

  const { error: refreshError } = await supabase.rpc('refresh_course_recommendations', {
    p_student_uuid: student.student_id,
  });
  if (refreshError) {
    return (
      <section className={styles.notice}>
        <h1>Could not update your recommendations</h1>
        <p>Confirm migrations 004 and 005 are applied in Supabase, then try again.</p>
      </section>
    );
  }

  const { data: recommendations, error: recommendationsError } = await supabase
    .from('recommendations')
    .select(`
      recommendation_id,
      match_score,
      matched_skills,
      missing_skills,
      improvement_skills,
      created_at,
      courses (
        course_id,
        title,
        description,
        provider,
        difficulty_level,
        course_url,
        duration,
        category
      )
    `)
    .eq('student_id', student.student_id)
    .order('match_score', { ascending: false })
    .order('recommendation_id');

  if (recommendationsError) {
    return <p className={styles.notice}>We could not load saved recommendations. Please try again.</p>;
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>BASED ON YOUR DATABASE PROFILE</span>
          <h1>Your course recommendations</h1>
          <p>
            {student.career_goal
              ? `Ranked using your skills and the goal “${student.career_goal}”.`
              : 'Ranked using your recorded skills and proficiency levels.'}
          </p>
        </div>
        <Link href="/skills" className="btn btn-outline-primary">Update my skills</Link>
      </header>

      {recommendations.length === 0 ? (
        <div className={styles.empty}>
          <h2>No matches yet</h2>
          <p>Add skills to your profile, or check back when more courses match your skills.</p>
          <Link href="/skills" className="btn btn-primary">Add skills</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {recommendations.map(recommendation => {
            const course = recommendation.courses;
            if (!course) return null;
            return (
              <article key={recommendation.recommendation_id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.category}>{course.category} · {course.difficulty_level}</span>
                    <h2>{course.title}</h2>
                    <p className={styles.provider}>{course.provider} · {course.duration}</p>
                  </div>
                  <div className={styles.score}>
                    <strong>{Number(recommendation.match_score).toFixed(1)}%</strong>
                    <span>match</span>
                  </div>
                </div>
                <p className={styles.description}>{course.description}</p>
                {recommendation.matched_skills.length > 0 && (
                  <SkillList title="Matched skills" items={recommendation.matched_skills} type="matched" />
                )}
                {recommendation.improvement_skills.length > 0 && (
                  <SkillList title="Skills to improve" items={recommendation.improvement_skills} type="improve" />
                )}
                {recommendation.missing_skills.length > 0 && (
                  <SkillList title="Skills to learn" items={recommendation.missing_skills} type="missing" />
                )}
                <a href={course.course_url} target="_blank" rel="noreferrer" className={styles.courseLink}>
                  Visit provider <span aria-hidden="true">↗</span>
                </a>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SkillList({ title, items, type }) {
  return (
    <div className={styles.skillGroup}>
      <h3>{title}</h3>
      <ul className={styles.skillList}>
        {items.map(skill => (
          <li key={skill.skill_id} className={styles[type]}>
            <span>{skill.skill_name}</span>
            {skill.student_proficiency && <small>{skill.student_proficiency}</small>}
            <small>Target: {skill.required_proficiency}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

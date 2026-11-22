import { createClient } from '../../../lib/supabase/server';
import CourseCatalog from '../../../components/CourseCatalog';

export const metadata = { title: 'Course Catalog – SkillPath' };

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from('course_catalog')
    .select('*')
    .order('title');

  if (error) {
    return (
      <section className="card">
        <h1>Could not load the course catalog</h1>
        <p className="text-muted">
          Confirm migrations 004 and 005 are applied in Supabase. If they are, try again later.
        </p>
      </section>
    );
  }

  return <CourseCatalog courses={courses || []} />;
}

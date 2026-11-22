-- Idempotent catalog seed. Course links point to established provider pages;
-- verify current availability before presenting any provider's offering.

INSERT INTO public.skills (skill_name, category) VALUES
  ('Pandas', 'Data Science'),
  ('HTML', 'Web Development'),
  ('CSS', 'Web Development'),
  ('JavaScript', 'Programming'),
  ('Git', 'Programming'),
  ('Node.js', 'Programming'),
  ('REST APIs', 'Web Development'),
  ('Power BI', 'Data Science'),
  ('Tableau', 'Data Science'),
  ('Scikit-learn', 'AI'),
  ('Matplotlib', 'Data Science'),
  ('TensorFlow', 'AI'),
  ('Keras', 'AI'),
  ('NumPy', 'Data Science'),
  ('Azure', 'Cloud Computing'),
  ('Linux', 'Cloud Computing'),
  ('Docker', 'Cloud Computing'),
  ('AWS', 'Cloud Computing'),
  ('Network Security', 'Cybersecurity'),
  ('Cryptography', 'Cybersecurity'),
  ('PostgreSQL', 'Database'),
  ('Kubernetes', 'Cloud Computing')
ON CONFLICT (skill_name) DO NOTHING;

DO $validate_course_skill_seed$
DECLARE
  missing_skill_names TEXT;
BEGIN
  SELECT string_agg(requested.skill_name, ', ' ORDER BY requested.skill_name)
  INTO missing_skill_names
  FROM (
    SELECT DISTINCT expected_skill.skill_name
    FROM (VALUES
      ('Python'),
      ('SQL'),
      ('Pandas'),
      ('HTML'),
      ('CSS'),
      ('JavaScript'),
      ('React'),
      ('Git'),
      ('Node.js'),
      ('REST APIs'),
      ('Power BI'),
      ('Tableau'),
      ('Scikit-learn'),
      ('Matplotlib'),
      ('TensorFlow'),
      ('Keras'),
      ('NumPy'),
      ('Azure'),
      ('Linux'),
      ('Docker'),
      ('AWS'),
      ('Network Security'),
      ('Cryptography'),
      ('PostgreSQL'),
      ('Kubernetes')
    ) AS expected_skill(skill_name)
  ) AS requested
  LEFT JOIN public.skills AS catalog_skill
    ON catalog_skill.skill_name = requested.skill_name
  WHERE catalog_skill.skill_id IS NULL;

  IF missing_skill_names IS NOT NULL THEN
    RAISE EXCEPTION
      'Course seed references skill names missing from public.skills: %',
      missing_skill_names;
  END IF;
END;
$validate_course_skill_seed$;

INSERT INTO public.courses (
  title, description, provider, difficulty_level, course_url, duration, category
) VALUES
  ('Python for Everybody', 'Learn Python programming and practical data handling.', 'Coursera - University of Michigan', 'Beginner', 'https://www.coursera.org/specializations/python', 'About 8 months', 'Programming'),
  ('Meta Front-End Developer', 'Build responsive interfaces with HTML, CSS, JavaScript, and React.', 'Coursera - Meta', 'Beginner', 'https://www.coursera.org/professional-certificates/meta-front-end-developer', 'About 7 months', 'Frontend Development'),
  ('IBM Full Stack Software Developer', 'Practice front-end, back-end, cloud-native, and DevOps fundamentals.', 'Coursera - IBM', 'Beginner', 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer', 'About 6 months', 'Full Stack Development'),
  ('IBM Back-End Development', 'Study server-side development, APIs, containers, and databases.', 'Coursera - IBM', 'Beginner', 'https://www.coursera.org/professional-certificates/ibm-backend-development', 'About 4 months', 'Backend Development'),
  ('Google Data Analytics', 'Develop foundational data analysis and visualization skills.', 'Coursera - Google', 'Beginner', 'https://www.coursera.org/professional-certificates/google-data-analytics', 'About 6 months', 'Data Analytics'),
  ('IBM Data Science', 'Explore Python, SQL, data analysis, and machine learning workflows.', 'Coursera - IBM', 'Beginner', 'https://www.coursera.org/professional-certificates/ibm-data-science', 'About 4 months', 'Data Science'),
  ('Deep Learning Specialization', 'Learn neural networks and deep learning concepts with Python.', 'Coursera - DeepLearning.AI', 'Intermediate', 'https://www.coursera.org/specializations/deep-learning', 'About 3 months', 'Machine Learning'),
  ('Google Machine Learning Crash Course', 'Study practical machine learning concepts and exercises.', 'Google', 'Intermediate', 'https://developers.google.com/machine-learning/crash-course', 'About 15 hours', 'Machine Learning'),
  ('Azure Fundamentals Learning Path', 'Understand core cloud concepts and Microsoft Azure services.', 'Microsoft Learn', 'Beginner', 'https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/', 'Self-paced', 'Cloud Computing'),
  ('AWS Cloud Practitioner Training', 'Build foundational knowledge of AWS cloud services and terminology.', 'AWS', 'Beginner', 'https://aws.amazon.com/training/learn-about/cloud-practitioner/', 'Self-paced', 'Cloud Computing'),
  ('Introduction to Cybersecurity', 'Learn cybersecurity essentials, threats, and defensive practices.', 'Cisco Networking Academy', 'Beginner', 'https://www.netacad.com/courses/introduction-to-cybersecurity', 'About 6 hours', 'Cybersecurity'),
  ('CS50 Introduction to Programming with Python', 'Learn Python through problem sets and programming exercises.', 'Harvard University', 'Beginner', 'https://cs50.harvard.edu/python/', '10 weeks', 'Programming'),
  ('Learn HTML', 'Learn semantic HTML and foundational web document structure.', 'web.dev', 'Beginner', 'https://web.dev/learn/html/', 'Self-paced', 'Frontend Development'),
  ('Learn CSS', 'Study modern CSS layout, responsive design, and styling.', 'web.dev', 'Beginner', 'https://web.dev/learn/css/', 'Self-paced', 'Frontend Development'),
  ('React - Learn', 'Build user interfaces with components, state, and React patterns.', 'React', 'Intermediate', 'https://react.dev/learn', 'Self-paced', 'Frontend Development'),
  ('Docker 101', 'Get started with containers and foundational Docker workflows.', 'Docker', 'Beginner', 'https://www.docker.com/101-tutorial/', 'Self-paced', 'Cloud Computing'),
  ('Kubernetes Basics', 'Learn core Kubernetes concepts through interactive tutorials.', 'Kubernetes', 'Intermediate', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', 'Self-paced', 'Cloud Computing'),
  ('PostgreSQL Exercises', 'Practice SQL queries using a sample relational database.', 'PGExercises', 'Intermediate', 'https://pgexercises.com/', 'Self-paced', 'Databases')
ON CONFLICT (course_url) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  provider = EXCLUDED.provider,
  difficulty_level = EXCLUDED.difficulty_level,
  duration = EXCLUDED.duration,
  category = EXCLUDED.category,
  updated_at = now();

WITH goal_map(course_title, provider, career_goal) AS (
  VALUES
    ('Python for Everybody', 'Coursera - University of Michigan', 'Data Scientist'),
    ('Python for Everybody', 'Coursera - University of Michigan', 'Data Analyst'),
    ('Meta Front-End Developer', 'Coursera - Meta', 'Frontend Developer'),
    ('Meta Front-End Developer', 'Coursera - Meta', 'Full Stack Developer'),
    ('IBM Full Stack Software Developer', 'Coursera - IBM', 'Full Stack Developer'),
    ('IBM Back-End Development', 'Coursera - IBM', 'Backend Developer'),
    ('IBM Back-End Development', 'Coursera - IBM', 'Full Stack Developer'),
    ('Google Data Analytics', 'Coursera - Google', 'Data Analyst'),
    ('IBM Data Science', 'Coursera - IBM', 'Data Scientist'),
    ('IBM Data Science', 'Coursera - IBM', 'Data Analyst'),
    ('Deep Learning Specialization', 'Coursera - DeepLearning.AI', 'Machine Learning Engineer'),
    ('Deep Learning Specialization', 'Coursera - DeepLearning.AI', 'AI Engineer'),
    ('Google Machine Learning Crash Course', 'Google', 'Machine Learning Engineer'),
    ('Google Machine Learning Crash Course', 'Google', 'AI Engineer'),
    ('Azure Fundamentals Learning Path', 'Microsoft Learn', 'Cloud Engineer'),
    ('AWS Cloud Practitioner Training', 'AWS', 'Cloud Engineer'),
    ('Introduction to Cybersecurity', 'Cisco Networking Academy', 'Cybersecurity Engineer'),
    ('CS50 Introduction to Programming with Python', 'Harvard University', 'Backend Developer'),
    ('Learn HTML', 'web.dev', 'Frontend Developer'),
    ('Learn CSS', 'web.dev', 'Frontend Developer'),
    ('React - Learn', 'React', 'Frontend Developer'),
    ('React - Learn', 'React', 'Full Stack Developer'),
    ('Docker 101', 'Docker', 'Cloud Engineer'),
    ('Kubernetes Basics', 'Kubernetes', 'Cloud Engineer'),
    ('PostgreSQL Exercises', 'PGExercises', 'Data Analyst'),
    ('PostgreSQL Exercises', 'PGExercises', 'Backend Developer')
)
INSERT INTO public.course_career_goals (course_id, career_goal)
SELECT course.course_id, goal_map.career_goal
FROM goal_map
JOIN public.courses AS course
  ON course.title = goal_map.course_title
  AND course.provider = goal_map.provider
ON CONFLICT (course_id, career_goal) DO NOTHING;

WITH skill_map(course_title, provider, skill_name, importance, required_proficiency) AS (
  VALUES
    ('Python for Everybody', 'Coursera - University of Michigan', 'Python', 5, 'Beginner'),
    ('Python for Everybody', 'Coursera - University of Michigan', 'SQL', 3, 'Beginner'),
    ('Python for Everybody', 'Coursera - University of Michigan', 'Pandas', 2, 'Beginner'),
    ('Meta Front-End Developer', 'Coursera - Meta', 'HTML', 5, 'Beginner'),
    ('Meta Front-End Developer', 'Coursera - Meta', 'CSS', 5, 'Beginner'),
    ('Meta Front-End Developer', 'Coursera - Meta', 'JavaScript', 5, 'Beginner'),
    ('Meta Front-End Developer', 'Coursera - Meta', 'React', 4, 'Beginner'),
    ('Meta Front-End Developer', 'Coursera - Meta', 'Git', 2, 'Beginner'),
    ('IBM Full Stack Software Developer', 'Coursera - IBM', 'HTML', 4, 'Beginner'),
    ('IBM Full Stack Software Developer', 'Coursera - IBM', 'CSS', 3, 'Beginner'),
    ('IBM Full Stack Software Developer', 'Coursera - IBM', 'JavaScript', 4, 'Beginner'),
    ('IBM Full Stack Software Developer', 'Coursera - IBM', 'React', 3, 'Beginner'),
    ('IBM Full Stack Software Developer', 'Coursera - IBM', 'Node.js', 4, 'Beginner'),
    ('IBM Full Stack Software Developer', 'Coursera - IBM', 'Docker', 2, 'Beginner'),
    ('IBM Back-End Development', 'Coursera - IBM', 'Python', 3, 'Beginner'),
    ('IBM Back-End Development', 'Coursera - IBM', 'Node.js', 4, 'Beginner'),
    ('IBM Back-End Development', 'Coursera - IBM', 'REST APIs', 5, 'Beginner'),
    ('IBM Back-End Development', 'Coursera - IBM', 'SQL', 4, 'Beginner'),
    ('IBM Back-End Development', 'Coursera - IBM', 'Docker', 2, 'Beginner'),
    ('Google Data Analytics', 'Coursera - Google', 'SQL', 5, 'Beginner'),
    ('Google Data Analytics', 'Coursera - Google', 'Power BI', 3, 'Beginner'),
    ('Google Data Analytics', 'Coursera - Google', 'Tableau', 3, 'Beginner'),
    ('Google Data Analytics', 'Coursera - Google', 'Python', 2, 'Beginner'),
    ('IBM Data Science', 'Coursera - IBM', 'Python', 5, 'Beginner'),
    ('IBM Data Science', 'Coursera - IBM', 'SQL', 4, 'Beginner'),
    ('IBM Data Science', 'Coursera - IBM', 'Pandas', 4, 'Beginner'),
    ('IBM Data Science', 'Coursera - IBM', 'Scikit-learn', 3, 'Beginner'),
    ('IBM Data Science', 'Coursera - IBM', 'Matplotlib', 2, 'Beginner'),
    ('Deep Learning Specialization', 'Coursera - DeepLearning.AI', 'Python', 4, 'Intermediate'),
    ('Deep Learning Specialization', 'Coursera - DeepLearning.AI', 'TensorFlow', 5, 'Intermediate'),
    ('Deep Learning Specialization', 'Coursera - DeepLearning.AI', 'Keras', 4, 'Intermediate'),
    ('Deep Learning Specialization', 'Coursera - DeepLearning.AI', 'NumPy', 3, 'Intermediate'),
    ('Google Machine Learning Crash Course', 'Google', 'Python', 3, 'Beginner'),
    ('Google Machine Learning Crash Course', 'Google', 'NumPy', 4, 'Beginner'),
    ('Google Machine Learning Crash Course', 'Google', 'Pandas', 3, 'Beginner'),
    ('Google Machine Learning Crash Course', 'Google', 'Scikit-learn', 5, 'Beginner'),
    ('Azure Fundamentals Learning Path', 'Microsoft Learn', 'Azure', 5, 'Beginner'),
    ('Azure Fundamentals Learning Path', 'Microsoft Learn', 'Linux', 3, 'Beginner'),
    ('Azure Fundamentals Learning Path', 'Microsoft Learn', 'Docker', 2, 'Beginner'),
    ('AWS Cloud Practitioner Training', 'AWS', 'AWS', 5, 'Beginner'),
    ('AWS Cloud Practitioner Training', 'AWS', 'Docker', 3, 'Beginner'),
    ('AWS Cloud Practitioner Training', 'AWS', 'Linux', 2, 'Beginner'),
    ('Introduction to Cybersecurity', 'Cisco Networking Academy', 'Network Security', 5, 'Beginner'),
    ('Introduction to Cybersecurity', 'Cisco Networking Academy', 'Linux', 3, 'Beginner'),
    ('Introduction to Cybersecurity', 'Cisco Networking Academy', 'Cryptography', 2, 'Beginner'),
    ('CS50 Introduction to Programming with Python', 'Harvard University', 'Python', 5, 'Beginner'),
    ('CS50 Introduction to Programming with Python', 'Harvard University', 'SQL', 2, 'Beginner'),
    ('Learn HTML', 'web.dev', 'HTML', 5, 'Beginner'),
    ('Learn HTML', 'web.dev', 'CSS', 2, 'Beginner'),
    ('Learn CSS', 'web.dev', 'CSS', 5, 'Beginner'),
    ('Learn CSS', 'web.dev', 'HTML', 2, 'Beginner'),
    ('React - Learn', 'React', 'JavaScript', 5, 'Intermediate'),
    ('React - Learn', 'React', 'React', 5, 'Beginner'),
    ('React - Learn', 'React', 'HTML', 2, 'Beginner'),
    ('Docker 101', 'Docker', 'Docker', 5, 'Beginner'),
    ('Docker 101', 'Docker', 'Linux', 3, 'Beginner'),
    ('Docker 101', 'Docker', 'Git', 2, 'Beginner'),
    ('Kubernetes Basics', 'Kubernetes', 'Kubernetes', 5, 'Beginner'),
    ('Kubernetes Basics', 'Kubernetes', 'Docker', 4, 'Beginner'),
    ('Kubernetes Basics', 'Kubernetes', 'Linux', 3, 'Beginner'),
    ('PostgreSQL Exercises', 'PGExercises', 'PostgreSQL', 5, 'Beginner'),
    ('PostgreSQL Exercises', 'PGExercises', 'SQL', 5, 'Beginner')
)
INSERT INTO public.course_skills (course_id, skill_id, importance, required_proficiency)
SELECT course.course_id, skill.skill_id, skill_map.importance, skill_map.required_proficiency
FROM skill_map
JOIN public.courses AS course
  ON course.title = skill_map.course_title
  AND course.provider = skill_map.provider
JOIN public.skills AS skill ON skill.skill_name = skill_map.skill_name
ON CONFLICT (course_id, skill_id) DO UPDATE
SET
  importance = EXCLUDED.importance,
  required_proficiency = EXCLUDED.required_proficiency;

-- This migration does not impersonate users or relax the refresh RPC's
-- ownership check. An authenticated current user may be refreshed here;
-- other students are refreshed by the protected RPC when they next open
-- the recommendations page.
DO $refresh_current_student$
DECLARE
  current_student_id UUID := auth.uid();
BEGIN
  IF current_student_id IS NOT NULL THEN
    PERFORM public.refresh_course_recommendations(current_student_id);
  END IF;
END;
$refresh_current_student$;

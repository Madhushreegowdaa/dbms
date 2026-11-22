-- Run against a development project. Replace the UUID and use an authenticated
-- user's JWT context for the ownership-scoped RPC and refresh examples.

-- 1. Read courses together with their skill requirements from the view.
SELECT
  course.title,
  course.provider,
  required_skill ->> 'skill_name' AS skill_name,
  required_skill ->> 'required_proficiency' AS required_proficiency,
  (required_skill ->> 'importance')::integer AS importance
FROM public.course_catalog AS course
CROSS JOIN LATERAL jsonb_array_elements(course.required_skills) AS required_skill
ORDER BY course.title, skill_name;

-- 2. Join students, student skills, and the skills catalog.
SELECT
  student.name,
  skill.skill_name,
  student_skill.proficiency_level
FROM public.students AS student
JOIN public.student_skills AS student_skill ON student_skill.student_id = student.student_id
JOIN public.skills AS skill ON skill.skill_id = student_skill.skill_id
WHERE student.student_id = '00000000-0000-0000-0000-000000000000'
ORDER BY skill.skill_name;

-- 3. Aggregate skills by proficiency for each student.
SELECT
  student.student_id,
  student.name,
  count(student_skill.skill_id) AS skill_count,
  count(*) FILTER (WHERE student_skill.proficiency_level = 'Beginner') AS beginner_count,
  count(*) FILTER (WHERE student_skill.proficiency_level = 'Intermediate') AS intermediate_count,
  count(*) FILTER (WHERE student_skill.proficiency_level = 'Advanced') AS advanced_count
FROM public.students AS student
LEFT JOIN public.student_skills AS student_skill ON student_skill.student_id = student.student_id
GROUP BY student.student_id, student.name
ORDER BY skill_count DESC, student.student_id;

-- 4. Subquery: find courses where a particular student is missing a required skill.
SELECT course.title, skill.skill_name, requirement.required_proficiency
FROM public.courses AS course
JOIN public.course_skills AS requirement ON requirement.course_id = course.course_id
JOIN public.skills AS skill ON skill.skill_id = requirement.skill_id
WHERE requirement.skill_id NOT IN (
  SELECT student_skill.skill_id
  FROM public.student_skills AS student_skill
  WHERE student_skill.student_id = '00000000-0000-0000-0000-000000000000'
)
ORDER BY course.title, skill.skill_name;

-- 5. Ranked recommendation function (empty without a matching authenticated
-- student, by design).
SELECT *
FROM public.get_course_recommendations(
  '00000000-0000-0000-0000-000000000000'::uuid
);

-- 6. Persist the current ranked result and inspect saved snapshots.
BEGIN;
SELECT public.refresh_course_recommendations(
  '00000000-0000-0000-0000-000000000000'::uuid
);
SELECT
  course.title,
  saved.match_score,
  saved.matched_skills,
  saved.missing_skills,
  saved.improvement_skills,
  saved.created_at
FROM public.recommendations AS saved
JOIN public.courses AS course ON course.course_id = saved.course_id
WHERE saved.student_id = '00000000-0000-0000-0000-000000000000'
ORDER BY saved.match_score DESC, course.title;
COMMIT;

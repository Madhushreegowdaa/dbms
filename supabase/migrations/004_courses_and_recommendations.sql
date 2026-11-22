-- Course catalog, normalized course requirements, and student recommendations.

CREATE TABLE IF NOT EXISTS public.courses (
  course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(btrim(title)) > 0),
  description TEXT NOT NULL CHECK (length(btrim(description)) > 0),
  provider TEXT NOT NULL CHECK (length(btrim(provider)) > 0),
  difficulty_level TEXT NOT NULL
    CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  course_url TEXT NOT NULL UNIQUE
    CHECK (course_url ~ '^https://[^[:space:]]+$'),
  duration TEXT NOT NULL CHECK (length(btrim(duration)) > 0),
  category TEXT NOT NULL CHECK (length(btrim(category)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (title, provider)
);

CREATE INDEX IF NOT EXISTS idx_courses_category_difficulty
  ON public.courses (category, difficulty_level);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.course_skills (
  course_id UUID NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES public.skills(skill_id) ON DELETE RESTRICT,
  importance SMALLINT NOT NULL CHECK (importance BETWEEN 1 AND 5),
  required_proficiency TEXT NOT NULL
    CHECK (required_proficiency IN ('Beginner', 'Intermediate', 'Advanced')),
  PRIMARY KEY (course_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_course_skills_skill_id
  ON public.course_skills (skill_id);

-- Student career goals are free text. This relation stores exact, normalized
-- course goal labels without duplicating goals in the courses row.
CREATE TABLE IF NOT EXISTS public.course_career_goals (
  course_id UUID NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
  career_goal TEXT NOT NULL CHECK (length(btrim(career_goal)) > 0),
  PRIMARY KEY (course_id, career_goal)
);

CREATE INDEX IF NOT EXISTS idx_course_career_goals_goal
  ON public.course_career_goals (lower(btrim(career_goal)));

CREATE TABLE IF NOT EXISTS public.recommendations (
  recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
  match_score NUMERIC(5, 2) NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(matched_skills) = 'array'),
  missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(missing_skills) = 'array'),
  improvement_skills JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(improvement_skills) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_student_score
  ON public.recommendations (student_id, match_score DESC, course_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_course_id
  ON public.recommendations (course_id);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS courses_select_authenticated ON public.courses;
CREATE POLICY courses_select_authenticated ON public.courses
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS course_skills_select_authenticated ON public.course_skills;
CREATE POLICY course_skills_select_authenticated ON public.course_skills
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS course_goals_select_authenticated ON public.course_career_goals;
CREATE POLICY course_goals_select_authenticated ON public.course_career_goals
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS recommendations_select_own ON public.recommendations;
CREATE POLICY recommendations_select_own ON public.recommendations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.students AS student
      WHERE student.student_id = recommendations.student_id
        AND student.student_id = (SELECT auth.uid())
    )
  );

GRANT SELECT ON public.courses, public.course_skills, public.course_career_goals TO authenticated;
GRANT SELECT ON public.recommendations TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.recommendations FROM anon, authenticated;

CREATE OR REPLACE VIEW public.course_catalog
WITH (security_invoker = true)
AS
SELECT
  course.course_id,
  course.title,
  course.description,
  course.provider,
  course.difficulty_level,
  course.course_url,
  course.duration,
  course.category,
  course.created_at,
  course.updated_at,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'skill_id', skill.skill_id,
        'skill_name', skill.skill_name,
        'importance', course_skill.importance,
        'required_proficiency', course_skill.required_proficiency
      )
      ORDER BY skill.skill_name
    ) FILTER (WHERE skill.skill_id IS NOT NULL),
    '[]'::jsonb
  ) AS required_skills
FROM public.courses AS course
LEFT JOIN public.course_skills AS course_skill
  ON course_skill.course_id = course.course_id
LEFT JOIN public.skills AS skill
  ON skill.skill_id = course_skill.skill_id
GROUP BY course.course_id;

GRANT SELECT ON public.course_catalog TO authenticated;

CREATE OR REPLACE FUNCTION public.get_course_recommendations(p_student_uuid UUID)
RETURNS TABLE (
  course_id UUID,
  title TEXT,
  description TEXT,
  provider TEXT,
  difficulty_level TEXT,
  course_url TEXT,
  duration TEXT,
  category TEXT,
  match_score NUMERIC,
  matched_skills JSONB,
  missing_skills JSONB,
  improvement_skills JSONB,
  career_goal_match BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  WITH viewer_student AS (
    SELECT
      student.student_id,
      NULLIF(btrim(student.career_goal), '') AS career_goal
    FROM public.students AS student
    WHERE student.student_id = p_student_uuid
      AND student.student_id = (SELECT auth.uid())
  ),
  skill_comparison AS (
    SELECT
      course.course_id,
      course.title,
      course.description,
      course.provider,
      course.difficulty_level,
      course.course_url,
      course.duration,
      course.category,
      course_skill.skill_id,
      skill.skill_name,
      course_skill.importance,
      course_skill.required_proficiency,
      student_skill.proficiency_level AS student_proficiency,
      CASE course_skill.required_proficiency
        WHEN 'Beginner' THEN 1
        WHEN 'Intermediate' THEN 2
        WHEN 'Advanced' THEN 3
      END AS required_level,
      CASE student_skill.proficiency_level
        WHEN 'Beginner' THEN 1
        WHEN 'Intermediate' THEN 2
        WHEN 'Advanced' THEN 3
      END AS student_level,
      EXISTS (
        SELECT 1
        FROM public.course_career_goals AS course_goal
        WHERE course_goal.course_id = course.course_id
          AND lower(btrim(course_goal.career_goal)) =
              lower(btrim(viewer_student.career_goal))
      ) AS career_goal_match
    FROM public.courses AS course
    JOIN public.course_skills AS course_skill
      ON course_skill.course_id = course.course_id
    JOIN public.skills AS skill
      ON skill.skill_id = course_skill.skill_id
    CROSS JOIN viewer_student
    LEFT JOIN public.student_skills AS student_skill
      ON student_skill.student_id = viewer_student.student_id
      AND student_skill.skill_id = course_skill.skill_id
  ),
  course_scores AS (
    SELECT
      comparison.course_id,
      comparison.title,
      comparison.description,
      comparison.provider,
      comparison.difficulty_level,
      comparison.course_url,
      comparison.duration,
      comparison.category,
      sum(comparison.importance)::numeric AS total_importance,
      sum(
        comparison.importance * CASE
          WHEN comparison.student_proficiency IS NULL THEN 0
          ELSE 0.4 + 0.6 * least(comparison.student_level, comparison.required_level)::numeric
                         / comparison.required_level
        END
      )::numeric AS fit_importance,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'skill_id', comparison.skill_id,
            'skill_name', comparison.skill_name,
            'student_proficiency', comparison.student_proficiency,
            'required_proficiency', comparison.required_proficiency,
            'importance', comparison.importance
          )
          ORDER BY comparison.skill_name
        ) FILTER (WHERE comparison.student_proficiency IS NOT NULL),
        '[]'::jsonb
      ) AS matched_skills,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'skill_id', comparison.skill_id,
            'skill_name', comparison.skill_name,
            'required_proficiency', comparison.required_proficiency,
            'importance', comparison.importance
          )
          ORDER BY comparison.skill_name
        ) FILTER (WHERE comparison.student_proficiency IS NULL),
        '[]'::jsonb
      ) AS missing_skills,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'skill_id', comparison.skill_id,
            'skill_name', comparison.skill_name,
            'student_proficiency', comparison.student_proficiency,
            'required_proficiency', comparison.required_proficiency,
            'importance', comparison.importance
          )
          ORDER BY comparison.skill_name
        ) FILTER (
          WHERE comparison.student_proficiency IS NOT NULL
            AND comparison.student_level < comparison.required_level
        ),
        '[]'::jsonb
      ) AS improvement_skills,
      bool_or(comparison.career_goal_match) AS career_goal_match,
      count(*) FILTER (WHERE comparison.student_proficiency IS NOT NULL) AS matched_count
    FROM skill_comparison AS comparison
    GROUP BY
      comparison.course_id,
      comparison.title,
      comparison.description,
      comparison.provider,
      comparison.difficulty_level,
      comparison.course_url,
      comparison.duration,
      comparison.category
  )
  SELECT
    score.course_id,
    score.title,
    score.description,
    score.provider,
    score.difficulty_level,
    score.course_url,
    score.duration,
    score.category,
    round(
      least(
        100::numeric,
        100 * score.fit_importance / NULLIF(score.total_importance, 0)
          + CASE WHEN score.career_goal_match THEN 10 ELSE 0 END
      ),
      2
    ) AS match_score,
    score.matched_skills,
    score.missing_skills,
    score.improvement_skills,
    score.career_goal_match
  FROM course_scores AS score
  WHERE score.matched_count > 0
    AND score.total_importance > 0
  ORDER BY
    match_score DESC,
    score.career_goal_match DESC,
    score.title,
    score.course_id;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_course_recommendations(p_student_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  affected_rows INTEGER;
BEGIN
  IF p_student_uuid IS NULL
    OR auth.uid() IS NULL
    OR p_student_uuid IS DISTINCT FROM auth.uid()
  THEN
    RAISE EXCEPTION 'You may only refresh recommendations for your own student profile.'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.students AS student
    WHERE student.student_id = p_student_uuid
  ) THEN
    RETURN 0;
  END IF;

  DELETE FROM public.recommendations AS saved
  WHERE saved.student_id = p_student_uuid
    AND NOT EXISTS (
      SELECT 1
      FROM public.get_course_recommendations(p_student_uuid) AS current_recommendation
      WHERE current_recommendation.course_id = saved.course_id
    );

  INSERT INTO public.recommendations (
    student_id,
    course_id,
    match_score,
    matched_skills,
    missing_skills,
    improvement_skills
  )
  SELECT
    p_student_uuid,
    recommendation.course_id,
    recommendation.match_score,
    recommendation.matched_skills,
    recommendation.missing_skills,
    recommendation.improvement_skills
  FROM public.get_course_recommendations(p_student_uuid) AS recommendation
  ON CONFLICT (student_id, course_id) DO UPDATE
  SET
    match_score = EXCLUDED.match_score,
    matched_skills = EXCLUDED.matched_skills,
    missing_skills = EXCLUDED.missing_skills,
    improvement_skills = EXCLUDED.improvement_skills,
    created_at = now();

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_course_recommendations(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.refresh_course_recommendations(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_course_recommendations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_course_recommendations(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.refresh_student_recommendations_after_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  affected_student_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'students' THEN
    affected_student_id := NEW.student_id;
  ELSIF TG_OP = 'DELETE' THEN
    affected_student_id := OLD.student_id;
  ELSE
    IF TG_OP = 'UPDATE' AND OLD.student_id IS DISTINCT FROM NEW.student_id
      AND EXISTS (
        SELECT 1
        FROM public.students AS student
        WHERE student.student_id = OLD.student_id
          AND student.student_id = auth.uid()
      )
    THEN
      PERFORM public.refresh_course_recommendations(OLD.student_id);
    END IF;
    affected_student_id := NEW.student_id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.students AS student
    WHERE student.student_id = affected_student_id
      AND student.student_id = auth.uid()
  ) THEN
    PERFORM public.refresh_course_recommendations(affected_student_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.refresh_student_recommendations_after_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_student_skills_refresh_recommendations ON public.student_skills;
CREATE TRIGGER trg_student_skills_refresh_recommendations
  AFTER INSERT OR UPDATE OR DELETE ON public.student_skills
  FOR EACH ROW EXECUTE FUNCTION public.refresh_student_recommendations_after_change();

DROP TRIGGER IF EXISTS trg_students_refresh_recommendations ON public.students;
CREATE TRIGGER trg_students_refresh_recommendations
  AFTER INSERT OR UPDATE OF career_goal ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.refresh_student_recommendations_after_change();

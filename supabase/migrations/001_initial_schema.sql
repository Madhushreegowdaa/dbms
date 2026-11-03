-- ============================================================
-- Migration: 001_initial_schema.sql
-- Person 1 Module: Student Profile & Skill Management
-- ============================================================

-- ─── STUDENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name      TEXT,
  email          TEXT,
  college        TEXT,
  branch         TEXT,
  academic_year  TEXT,
  career_goal    TEXT,
  bio            TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);

-- ─── SKILLS CATALOG (shared, read-only for students) ─────────
CREATE TABLE IF NOT EXISTS skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name  TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- ─── STUDENT_SKILLS (many-to-many join) ──────────────────────
CREATE TABLE IF NOT EXISTS student_skills (
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  skill_id     UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  proficiency  TEXT NOT NULL CHECK (proficiency IN ('Beginner','Intermediate','Advanced')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill_id   ON student_skills(skill_id);

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills        ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;

-- students: own row only
CREATE POLICY "students_select_own" ON students FOR SELECT
  USING (auth.uid() = auth_user_id);
CREATE POLICY "students_insert_own" ON students FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "students_update_own" ON students FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- skills: all authenticated users can read; no student writes
CREATE POLICY "skills_select_auth" ON skills FOR SELECT
  TO authenticated USING (true);

-- student_skills: own records only (via students join)
CREATE POLICY "ss_select_own" ON student_skills FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()));
CREATE POLICY "ss_insert_own" ON student_skills FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()));
CREATE POLICY "ss_update_own" ON student_skills FOR UPDATE
  USING (student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()));
CREATE POLICY "ss_delete_own" ON student_skills FOR DELETE
  USING (student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()));

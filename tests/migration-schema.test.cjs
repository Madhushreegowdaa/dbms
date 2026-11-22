const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const migrationDir = path.join(root, 'supabase', 'migrations');
const migration = fs.readFileSync(
  path.join(migrationDir, '004_courses_and_recommendations.sql'),
  'utf8'
).replace(/\r\n/g, '\n');
const initialSchema = fs.readFileSync(
  path.join(migrationDir, '001_initial_schema.sql'),
  'utf8'
).replace(/\r\n/g, '\n');
const exampleQueries = fs.readFileSync(
  path.join(root, 'supabase', 'queries', 'course_recommendations_examples.sql'),
  'utf8'
).replace(/\r\n/g, '\n');

test('course migration references the verified student and skill key types', () => {
  assert.match(
    migration,
    /skill_id BIGINT NOT NULL REFERENCES public\.skills\(skill_id\)/
  );
  assert.match(
    migration,
    /student_id UUID NOT NULL REFERENCES public\.students\(student_id\)/
  );
  assert.match(migration, /student\.student_id = \(SELECT auth\.uid\(\)\)/);
  assert.match(migration, /student_skill\.proficiency_level AS student_proficiency/);
  assert.match(migration, /CASE student_skill\.proficiency_level/);
  assert.doesNotMatch(migration, /auth_user_id|student_skills\.proficiency\b|student_skill\.proficiency\b|skill\.id\b|student\.id\b/);
});

test('course migration defines a compatible timestamp trigger function before using it', () => {
  const legacyFunction = initialSchema.match(
    /CREATE OR REPLACE FUNCTION update_updated_at\(\)\s+RETURNS TRIGGER\s+LANGUAGE plpgsql AS \$\$([\s\S]*?)\$\$;/i
  );
  const functionDefinition = migration.match(
    /CREATE OR REPLACE FUNCTION public\.update_updated_at\(\)\s+RETURNS trigger\s+LANGUAGE plpgsql\s+AS \$function\$([\s\S]*?)\$function\$;/
  );

  assert.ok(legacyFunction, 'Expected the original project timestamp trigger function');
  assert.ok(functionDefinition, 'Expected migration 004 to define the public timestamp trigger function');
  assert.match(legacyFunction[1], /NEW\.updated_at\s*=\s*now\(\)/i);
  assert.match(legacyFunction[1], /RETURN\s+NEW/i);
  assert.match(functionDefinition[1], /NEW\.updated_at\s*=\s*now\(\)/i);
  assert.match(functionDefinition[1], /RETURN\s+NEW\s*;/i);

  const functionPosition = migration.indexOf(functionDefinition[0]);
  const triggerPosition = migration.indexOf('CREATE TRIGGER trg_courses_updated_at');
  const functionCallPosition = migration.indexOf('EXECUTE FUNCTION public.update_updated_at()');
  assert.ok(triggerPosition >= 0, 'Expected the existing courses timestamp trigger');
  assert.ok(functionCallPosition > triggerPosition, 'Expected the trigger to call the timestamp function');
  assert.ok(functionPosition < triggerPosition, 'Timestamp function must be defined before its trigger');
});

test('course migration leaves existing migration policies untouched', () => {
  assert.match(migration, /EXECUTE FUNCTION public\.update_updated_at\(\)/);
  assert.doesNotMatch(migration, /DROP POLICY[^;]+ON public\.(students|skills|student_skills)/i);
  assert.doesNotMatch(migration, /ALTER TABLE public\.(students|skills|student_skills)\s/i);
});

test('SQL examples use the verified student and skill schema relationships', () => {
  assert.doesNotMatch(
    exampleQueries,
    /\bstudent\.id\b|\bstudent\.full_name\b|\bskill\.id\b|\bstudent_skill\.proficiency\b/
  );

  const joinExample = exampleQueries.split('-- 2. Join students, student skills, and the skills catalog.')[1]
    ?.split('-- 3. Aggregate skills by proficiency for each student.')[0];
  const aggregateExample = exampleQueries.split('-- 3. Aggregate skills by proficiency for each student.')[1]
    ?.split('-- 4. Subquery: find courses where a particular student is missing a required skill.')[0];
  const missingSkillsExample = exampleQueries.split('-- 4. Subquery: find courses where a particular student is missing a required skill.')[1]
    ?.split('-- 5. Ranked recommendation function')[0];

  assert.ok(joinExample, 'Expected student/skill join example');
  assert.ok(aggregateExample, 'Expected proficiency aggregate example');
  assert.ok(missingSkillsExample, 'Expected missing-skills subquery example');
  assert.match(joinExample, /student\.student_id/);
  assert.match(joinExample, /student\.name/);
  assert.match(joinExample, /student_skill\.proficiency_level/);
  assert.match(joinExample, /student_skill\.student_id\s*=\s*student\.student_id/);
  assert.match(joinExample, /skill\.skill_id\s*=\s*student_skill\.skill_id/);
  assert.match(aggregateExample, /student\.student_id/);
  assert.match(aggregateExample, /student_skill\.proficiency_level/);
  assert.match(aggregateExample, /student_skill\.student_id\s*=\s*student\.student_id/);
  assert.match(missingSkillsExample, /skill\.skill_id\s*=\s*requirement\.skill_id/);
});

test('security-definer functions pin search_path and verify the authenticated student id', () => {
  const securityDefinerFunctions = [...migration.matchAll(
    /CREATE OR REPLACE FUNCTION[\s\S]*?SECURITY DEFINER[\s\S]*?SET search_path = ''[\s\S]*?AS \$function\$[\s\S]*?\$function\$;/g
  )];

  assert.equal(securityDefinerFunctions.length, 2);
  assert.match(migration, /p_student_uuid IS DISTINCT FROM auth\.uid\(\)/);
  assert.match(migration, /student\.student_id = affected_student_id\s+AND student\.student_id = auth\.uid\(\)/);
});

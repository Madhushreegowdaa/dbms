const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const migrationDir = path.join(root, 'supabase', 'migrations');
const seedSql = fs.readFileSync(path.join(migrationDir, '005_seed_courses.sql'), 'utf8').replace(/\r\n/g, '\n');
const schemaSql = fs.readFileSync(path.join(migrationDir, '004_courses_and_recommendations.sql'), 'utf8').replace(/\r\n/g, '\n');
const recommendationsPage = fs.readFileSync(
  path.join(root, 'app', '(app)', 'recommendations', 'page.js'),
  'utf8'
).replace(/\r\n/g, '\n');

const courseSection = seedSql.split('ON CONFLICT (course_url) DO UPDATE')[0];
const courseRows = [...courseSection.matchAll(
  /^\s+\('([^']+)',\s*'[^']*',\s*'([^']+)',\s*'(?:Beginner|Intermediate|Advanced)',\s*'(https:\/\/[^']+)'/gm
)];
const goalSection = seedSql.match(/WITH goal_map[\s\S]*?\n\)\nINSERT INTO public\.course_career_goals/)[0];
const goalRows = [...goalSection.matchAll(/^\s+\('([^']+)',\s*'([^']+)',\s*'([^']+)'\),?$/gm)];
const skillSection = seedSql.match(/WITH skill_map[\s\S]*?\n\)\nINSERT INTO public\.course_skills/)[0];
const courseSkillRows = [...skillSection.matchAll(
  /^\s+\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*([1-5]),\s*'(Beginner|Intermediate|Advanced)'\),?$/gm
)];
const skillInsertSection = seedSql.match(
  /INSERT INTO public\.skills \(skill_name, category\) VALUES([\s\S]*?)ON CONFLICT \(skill_name\) DO NOTHING;/
)[1];
const insertedSkillRows = [...skillInsertSection.matchAll(
  /^\s*\('([^']+)',\s*'([^']+)'\),?$/gm
)].map(([, name, category]) => [name, category]);
const validationSection = seedSql.match(/DO \$validate_course_skill_seed\$[\s\S]*?\$validate_course_skill_seed\$;/)[0];
const validatedSkills = new Set(
  [...validationSection.matchAll(/^\s+\('([^']+)'\),?$/gm)].map(match => match[1])
);
const existingSkills = [
  ['Communication', 'Soft Skills', 'existing-communication-id'],
  ['Java', 'Programming', 'existing-java-id'],
  ['Machine Learning', 'AI', 'existing-machine-learning-id'],
  ['Python', 'Programming', 'existing-python-id'],
  ['React', 'Web Development', 'existing-react-id'],
  ['SQL', 'Database', 'existing-sql-id'],
];
const seededSkills = new Set([
  ...existingSkills.map(([name]) => name),
  ...insertedSkillRows.map(([name]) => name),
]);

const expectedCourseTitles = [
  'Python for Everybody',
  'Meta Front-End Developer',
  'IBM Full Stack Software Developer',
  'IBM Back-End Development',
  'Google Data Analytics',
  'IBM Data Science',
  'Deep Learning Specialization',
  'Google Machine Learning Crash Course',
  'Azure Fundamentals Learning Path',
  'AWS Cloud Practitioner Training',
  'Introduction to Cybersecurity',
  'CS50 Introduction to Programming with Python',
  'Learn HTML',
  'Learn CSS',
  'React - Learn',
  'Docker 101',
  'Kubernetes Basics',
  'PostgreSQL Exercises',
];

test('course seed contains all 18 expected HTTPS-linked courses', () => {
  assert.equal(courseRows.length, 18);
  assert.deepEqual(
    new Set(courseRows.map(([, title]) => title)),
    new Set(expectedCourseTitles)
  );
  assert.ok(courseRows.every(([, , , url]) => url.startsWith('https://')));
  assert.equal(new Set(courseRows.map(([, title, provider]) => `${title}\0${provider}`)).size, 18);
});

test('every skill mapping resolves and every seeded course has required skills', () => {
  const courseKeys = new Set(courseRows.map(([, title, provider]) => `${title}\0${provider}`));
  const skillsPerCourse = new Map();

  for (const [, title, provider, skillName] of courseSkillRows) {
    const courseKey = `${title}\0${provider}`;
    assert.ok(courseKeys.has(courseKey), `Unknown course/provider in skill mapping: ${title} / ${provider}`);
    assert.ok(seededSkills.has(skillName), `Unknown skill in course mapping: ${skillName}`);
    assert.ok(validatedSkills.has(skillName), `Skill is not covered by the migration validation: ${skillName}`);
    skillsPerCourse.set(courseKey, (skillsPerCourse.get(courseKey) || 0) + 1);
  }

  assert.ok(courseSkillRows.length > 0, 'Expected course skill mappings');
  assert.deepEqual(validatedSkills, new Set([...courseSkillRows].map(([, , , skillName]) => skillName)));
  assert.match(seedSql, /JOIN public\.skills AS skill ON skill\.skill_name = skill_map\.skill_name/);
  assert.match(seedSql, /SELECT course\.course_id, skill\.skill_id, skill_map\.importance/);
  assert.match(schemaSql, /skill_id BIGINT NOT NULL REFERENCES public\.skills\(skill_id\)/);
  for (const [, title, provider] of courseRows) {
    assert.ok((skillsPerCourse.get(`${title}\0${provider}`) || 0) >= 1, `${title} must have a required skill`);
  }
});

test('all 25 required skills exist after idempotently inserting the 22 missing catalog skills', () => {
  const existingNames = new Set(existingSkills.map(([name]) => name));
  const insertedNames = insertedSkillRows.map(([name]) => name);
  const allowedCategories = new Set([
    'Programming',
    'Web Development',
    'Database',
    'Data Science',
    'AI',
    'Cloud Computing',
    'Cybersecurity',
  ]);

  assert.equal(existingSkills.length, 6);
  assert.equal(insertedSkillRows.length, 22);
  assert.equal(new Set(insertedNames).size, insertedNames.length);
  assert.ok(insertedSkillRows.every(([, category]) => allowedCategories.has(category)));
  for (const name of insertedNames) {
    assert.ok(!existingNames.has(name), `Existing skill must not be reinserted: ${name}`);
  }
  assert.match(seedSql, /ON CONFLICT \(skill_name\) DO NOTHING/);
  assert.equal(validatedSkills.size, 25);
  assert.deepEqual(validatedSkills, new Set([...courseSkillRows].map(([, , , skillName]) => skillName)));
  for (const name of validatedSkills) {
    assert.ok(seededSkills.has(name), `Required course skill is absent after skill insertion: ${name}`);
  }

  const catalog = new Map(existingSkills.map(([name, category, id]) => [name, { category, id }]));
  const originalIds = new Map(existingSkills.map(([name, , id]) => [name, id]));
  for (let run = 0; run < 2; run++) {
    for (const [name, category] of insertedSkillRows) {
      if (!catalog.has(name)) catalog.set(name, { category, id: `seeded-${name}` });
    }
  }

  assert.equal(catalog.size, 28);
  for (const [name, id] of originalIds) {
    assert.equal(catalog.get(name).id, id, `Existing ID changed for ${name}`);
  }
});

test('career goals match an existing course/provider pair', () => {
  const courseKeys = new Set(courseRows.map(([, title, provider]) => `${title}\0${provider}`));
  assert.ok(goalRows.length > 0, 'Expected career-goal mappings');
  assert.match(seedSql, /course\.provider = goal_map\.provider/);
  for (const [, title, provider, goal] of goalRows) {
    assert.ok(courseKeys.has(`${title}\0${provider}`), `Unknown course/provider in goal mapping: ${title} / ${provider}`);
    assert.ok(goal.trim().length > 0);
  }
});

test('seed conflict keys make a second run idempotent', () => {
  assert.match(seedSql, /ON CONFLICT \(course_url\) DO UPDATE/);
  assert.match(seedSql, /ON CONFLICT \(course_id, career_goal\) DO NOTHING/);
  assert.match(seedSql, /ON CONFLICT \(course_id, skill_id\) DO UPDATE/);
  assert.match(schemaSql, /course_url TEXT NOT NULL UNIQUE/);
  assert.match(schemaSql, /UNIQUE \(title, provider\)/);
  assert.match(schemaSql, /PRIMARY KEY \(course_id, career_goal\)/);
  assert.match(schemaSql, /PRIMARY KEY \(course_id, skill_id\)/);
  assert.match(seedSql, /course\.provider = skill_map\.provider/);

  const courseKeys = new Set();
  const goalKeys = new Set();
  const skillKeys = new Set();
  for (let run = 0; run < 2; run++) {
    for (const row of courseRows) courseKeys.add(row[3]);
    for (const [, title, provider, goal] of goalRows) goalKeys.add(`${title}\0${provider}\0${goal}`);
    for (const [, title, provider, skill] of courseSkillRows) skillKeys.add(`${title}\0${provider}\0${skill}`);
  }

  assert.equal(courseKeys.size, 18);
  assert.equal(goalKeys.size, goalRows.length);
  assert.equal(skillKeys.size, courseSkillRows.length);
});

test('migration refresh remains ownership-scoped and seed does not impersonate profiles', () => {
  assert.match(seedSql, /PERFORM public\.refresh_course_recommendations\(current_student_id\)/);
  assert.match(seedSql, /current_student_id UUID := auth\.uid\(\)/);
  assert.match(seedSql, /other students are refreshed by the protected RPC when they next open/);
  assert.doesNotMatch(seedSql, /set_config\s*\(\s*['"]request\.jwt\.claim\.sub/i);
  assert.match(recommendationsPage, /rpc\('refresh_course_recommendations'/);
  assert.match(recommendationsPage, /p_student_uuid: student\.student_id/);
});

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');

const skillsPage = read('app/(app)/skills/page.js');
const skillsManager = read('components/SkillsManager.js');
const appLayout = read('app/(app)/layout.js');
const supabaseServer = read('lib/supabase/server.js');
const dashboardPage = read('app/(app)/dashboard/page.js');
const dashboardClient = read('app/(app)/dashboard/DashboardClient.js');
const profilePage = read('app/(app)/profile/page.js');
const profileForm = read('components/ProfileForm.js');
const signupPage = read('app/signup/page.js');

test('skills page loads only verified catalog and student-skill columns for the signed-in student', () => {
  assert.match(skillsPage, /\.select\('student_id'\)[\s\S]*?\.eq\('student_id', user\.id\)/);
  assert.match(skillsPage, /\.select\('skill_id, skill_name, category'\)/);
  assert.match(skillsPage, /\.select\('skill_id, proficiency_level'\)[\s\S]*?\.eq\('student_id', student\.student_id\)/);
  assert.doesNotMatch(skillsPage, /auth_user_id|student\.id|\bproficiency\b/);
});

test('skill add, proficiency update, and delete use deployed keys and proficiency column', () => {
  assert.match(skillsManager, /insert\(\{[\s\S]*?student_id: studentId,[\s\S]*?skill_id: skillId,[\s\S]*?proficiency_level: prof/);
  assert.match(skillsManager, /\.update\(\{ proficiency_level: editProf \}\)[\s\S]*?\.eq\('student_id', studentId\)[\s\S]*?\.eq\('skill_id', skillId\)/);
  assert.match(skillsManager, /\.delete\(\)\s*\.eq\('student_id', studentId\)\s*\.eq\('skill_id', skillId\)/);
  assert.match(skillsManager, /allSkills\.find\(s => s\.skill_id === ms\.skill_id\)/);
  assert.doesNotMatch(skillsManager, /skill\.id\b|\.proficiency\b/);
});

test('skills page avoids duplicate auth and serial catalog/profile requests', () => {
  assert.match(supabaseServer, /getAuthenticatedUser = cache\(async \(\) =>/);
  assert.match(appLayout, /getAuthenticatedUser\(\)/);
  assert.match(skillsPage, /getAuthenticatedUser\(\)/);
  assert.doesNotMatch(appLayout + skillsPage, /auth\.getUser\(\)/);
  const parallelQueries = skillsPage.match(/await Promise\.all\(\[([\s\S]*?)\]\);/);
  assert.ok(parallelQueries, 'Expected profile and catalog queries to run concurrently');
  assert.match(parallelQueries[1], /\.from\('students'\)/);
  assert.match(parallelQueries[1], /\.from\('skills'\)/);
});

test('skill mutations update local state without refreshing the full route and guard duplicate requests', () => {
  assert.doesNotMatch(skillsManager, /router\.refresh\(\)/);
  assert.match(skillsManager, /pendingSkillIds\.current\.has\(skillId\)/);
  assert.match(skillsManager, /pendingSkillIds\.current\.add\(skillId\)/);
  assert.match(skillsManager, /pendingSkillIds\.current\.delete\(skillId\)/);
  assert.match(skillsManager, /finally \{\s*pendingSkillIds\.current\.delete\(skillId\)/);
  assert.match(skillsManager, /setLoadingSkills\(current => new Set\(current\)\.add\(skillId\)\)/);
  assert.match(skillsManager, /if \(currentSkill\?\.proficiency_level === editProf\)/);
});

test('dashboard reads profile and proficiency values from the deployed schema', () => {
  assert.match(dashboardPage, /\.select\('student_id, name, email, branch, year, career_goal'\)/);
  assert.match(dashboardPage, /\.eq\('student_id', user\.id\)/);
  assert.match(dashboardPage, /\.select\('skill_id, proficiency_level, skills\(skill_name, category\)'\)/);
  assert.match(dashboardPage, /s\.proficiency_level === 'Beginner'/);
  assert.match(dashboardPage, /s\.proficiency_level === 'Intermediate'/);
  assert.match(dashboardPage, /s\.proficiency_level === 'Advanced'/);
  assert.match(dashboardClient, /s\.proficiency_level\.toLowerCase\(\)/);
  assert.doesNotMatch(dashboardPage + dashboardClient, /auth_user_id|student\.id\b|student\?\.full_name|academic_year|college|s\.proficiency\b/);
});

test('profile lookup and save use verified student columns without avatar functionality', () => {
  assert.match(profilePage, /\.select\('student_id, name, email, branch, year, career_goal'\)/);
  assert.match(profilePage, /\.eq\('student_id', user\.id\)/);
  assert.match(profileForm, /student\?\.name/);
  assert.match(profileForm, /student\?\.year/);
  assert.match(profileForm, /student_id: userId/);
  assert.match(profileForm, /onConflict: 'student_id'/);
  assert.doesNotMatch(profilePage + profileForm, /auth_user_id|student\?\.id|full_name|academic_year|college|bio/);
  assert.doesNotMatch(profilePage + profileForm, /avatar_url|student-avatars|storage\.from|handlePhotoChange|photoLoading/);
  assert.match(profileForm, /year: form\.year === '' \? null : form\.year/);
  assert.match(profileForm, /YEARS = \[1, 2, 3, 4, 5, 6\]/);
  assert.doesNotMatch(dashboardPage + dashboardClient, /avatar_url|avatarUrl|studentPhoto/);
});

test('signup trims the email, explains the example placeholder, and surfaces Supabase errors', () => {
  assert.match(signupPage, /const email = form\.email\.trim\(\)/);
  assert.match(signupPage, /auth\.signUp\(\{\s*email,/);
  assert.match(signupPage, /Use a real email address you can access/);
  assert.match(signupPage, /if \(err\) return setError\(err\.message\)/);
  assert.match(signupPage, /finally \{\s*setLoading\(false\)/);
});

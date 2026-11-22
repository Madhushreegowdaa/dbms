# Recommendation Engine

## Inputs and output

`get_course_recommendations(p_student_uuid)` reads:

- The authenticated student's `career_goal`.
- Their `student_skills` and proficiency levels.
- Course requirements from `course_skills`, including importance and required proficiency.
- Exact course goal labels from `course_career_goals`.

Each result contains course information, a score from 0 to 100, a JSONB array of matched skills, missing skills, under-level skills to improve, and a boolean career-goal match.

## Scoring

Proficiency levels are ordered Beginner = 1, Intermediate = 2, Advanced = 3. For each required skill:

```text
skill_fit =
  0                                      if the student does not have the skill
  0.4 + 0.6 * min(student_level, required_level) / required_level otherwise

weighted_skill_score =
  100 * sum(importance * skill_fit) / sum(importance)

final_score = min(100, weighted_skill_score + (10 if career goal matches else 0))
```

Importance is 1-5, so more important requirements contribute more. Possessing a skill contributes coverage; proficiency compatibility contributes the other 60% of that skill's fit. The goal bonus is additive and capped at 100. Ranking sorts by score descending, then exact goal match, title, and course UUID, which makes tie results deterministic.

## Eligibility and gaps

- Courses without required skills do not appear in the recommendation result.
- A course appears only when the student has at least one of its required skills. A student with no skills, no profile, or no eligible course receives an empty list rather than arbitrary recommendations.
- A skill with any recorded proficiency is matched. If it is below the requirement, it also appears under improvement skills; absent skills appear as missing.
- `(course_id, skill_id)` prevents duplicate requirements from inflating a course score.
- Course goals are compared with trimmed, case-insensitive exact matching. Custom student goals without a matching catalog label still receive skill-based recommendations without a goal bonus.
- The profile has no dedicated interests field, so this version does not infer or score interests from the free-text bio.

## Persistence and refresh

`refresh_course_recommendations(UUID)` recomputes the result, deletes now-ineligible saved rows, and upserts each current student/course pair protected by a unique constraint. It rejects refreshes for another student's profile. Triggers refresh after student skill/proficiency changes and career-goal changes; the recommendations page also refreshes before displaying saved rows. A course catalog change is reflected the next time a student's recommendations refresh.

The score and JSONB skill arrays in `recommendations` are snapshots, so their `created_at` value is refreshed when recalculated. The underlying course, skill, and student-skill relations remain the source data.

## Database verification required

These are migration definitions, not proof of deployment. Apply migrations 004 and 005 to a development Supabase project, sign in as a test student, add skills at different proficiency levels, and verify both the RPC output and persisted `recommendations` rows under RLS before presenting live behavior as verified.

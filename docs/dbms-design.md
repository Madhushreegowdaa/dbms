# DBMS Design

## Relational model

The verified deployed schema supplies `students`, `skills`, and `student_skills`. Migration 004 adds the course catalog, two many-to-many relations, and saved recommendations:

| Relation | Key and relationship | Purpose |
|---|---|---|
| `students` | `student_id` PK and FK to `auth.users(id)` | Student profile and free-text career goal |
| `skills` | `skill_id BIGINT` identity PK; unique `skill_name` | Shared skills catalog |
| `student_skills` | `(student_id, skill_id)` composite PK; FKs to students and skills | `proficiency_level` for each student skill |
| `courses` | `course_id` PK; unique `course_url` | Course catalog |
| `course_skills` | `(course_id, skill_id)` composite PK; FKs to courses and skills | Required skills, importance, and proficiency |
| `course_career_goals` | `(course_id, career_goal)` composite PK; FK to courses | Exact career goals associated with courses |
| `recommendations` | `recommendation_id` PK; unique `(student_id, course_id)`; FKs to students and courses | Refreshed recommendation score and skill-gap snapshot |

`course_career_goals` is an additional relation to model course-to-goal matching without storing repeating goal values in the course row. Goal labels match case-insensitively after trimming. The profile keeps its existing free-text field.

## Integrity and normalization

- Junction-table composite keys prevent duplicate student-skill and course-skill associations.
- Foreign keys use cascade deletion for dependent course/student records; catalog skill references use `ON DELETE RESTRICT` so referenced catalog skills cannot be removed accidentally.
- Course difficulty and skill proficiency values are constrained to Beginner, Intermediate, or Advanced.
- Importance is constrained to 1 through 5; recommendation scores are constrained to 0 through 100.
- URLs must use HTTPS, and required fields reject blank text.
- The core catalog is in 3NF: skill and course descriptions are stored once; junction attributes depend on their full composite keys.
- JSONB arrays on recommendations are intentionally stored snapshots of the matched, missing, and improvement skills at refresh time. They are derived data, not a second source of truth.

## Indexes, view, functions, and triggers

- Existing migrations index student authentication, skill category, and both student-skill foreign keys.
- Migration 004 indexes course category/difficulty, reverse course-skill lookup, career-goal lookup, and student recommendation ranking.
- `course_catalog` joins courses to required skills in a read-only view.
- `get_course_recommendations(UUID)` performs the weighted matching and returns ranked results.
- `refresh_course_recommendations(UUID)` atomically removes stale snapshots and upserts current rows. PostgreSQL transaction semantics apply to the function call.
- Triggers refresh recommendations after a student's goal changes or their skills/proficiencies are inserted, updated, or deleted. The existing `update_updated_at()` trigger is reused for courses.
- There is no separate PostgreSQL stored procedure; PostgreSQL functions implement the required query and refresh operations.

## Authorization

RLS is enabled for the new tables. Authenticated users can read the catalog. Recommendations are selectable only when their `student_id` belongs to the current `auth.uid()`. Direct recommendation-table writes are revoked from `anon` and `authenticated`; the security-definer refresh function verifies ownership before writing. The recommendation query itself is invoker-scoped and filters by the authenticated student's profile.

The policies and functions are defined in migration 004 but are not confirmed deployed until it has been applied and tested in the Supabase project. Note: repository migrations 001-003 describe a different historical schema than the verified deployed schema in this project; they are intentionally unchanged. A clean replay of 001-005 is therefore not equivalent to upgrading the existing database.

## Demonstrating database operations

Run the examples in [`supabase/queries/course_recommendations_examples.sql`](../supabase/queries/course_recommendations_examples.sql) in a non-production project. They demonstrate joins, grouping/aggregates, subqueries, the catalog view, ranked function calls, and refresh. Auth-scoped RPC examples should be run as the authenticated student; the Supabase SQL Editor does not automatically provide that user's JWT context.

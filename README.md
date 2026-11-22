# Student Skill and Course Recommendation System

SkillPath is a Next.js application backed by Supabase Authentication and PostgreSQL. Students maintain a profile and proficiency-rated skills; the database compares those skills with course requirements, ranks relevant courses, identifies skill gaps, and saves recommendation snapshots.

## Requirements

- Node.js compatible with Next.js 16
- A Supabase project
- The Supabase project URL and publishable key

Create `.env.local` in the project root (the directory containing `package.json`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-project-publishable-key
```

Do not commit `.env.local` or share its contents. `.gitignore` excludes it. The application validates that both settings are present when creating a Supabase client.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase database setup

The repository includes legacy migrations `001_initial_schema.sql` through `003_student_avatar.sql` for the student profile, skills catalog, student skills, and storage. The application currently does not use avatar storage. The new course and recommendation features require these additional migrations, applied in order:

1. `supabase/migrations/004_courses_and_recommendations.sql`
2. `supabase/migrations/005_seed_courses.sql`

Apply each file using the Supabase SQL Editor or the project's approved migration workflow. Do not run these against production until the SQL has been reviewed and backed up. These files are repository migrations; this repository change does not apply them to your hosted Supabase project.

The catalog contains 18 sample courses, links to provider-maintained learning pages, skill requirements that reference the existing seeded skill catalog, and exact career-goal labels. Confirm course availability and terms with providers before relying on an offering.

## Main features

- Authentication-protected dashboard, profile editing, and skill management.
- Searchable course catalog at `/courses`.
- Ranked recommendations at `/recommendations`, computed by PostgreSQL and persisted for the current student.
- PostgreSQL RLS policies restrict profile and recommendation data to the owning authenticated user.

## Database documentation

- [DBMS design and SQL examples](./docs/dbms-design.md)
- [Recommendation scoring and persistence](./docs/recommendation-engine.md)
- [Data architecture and ER diagram](./.github/modernize/assessment/engines/facts/data-architecture.md)
- SQL query examples: `supabase/queries/course_recommendations_examples.sql`

## Checks

```bash
npm test
npm run lint
npm run build
```

The SQL migrations must be applied to a development Supabase project and exercised there to verify database behavior end to end.

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './CourseCatalog.module.css';

export default function CourseCatalog({ courses }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...new Set(courses.map(course => course.category))],
    [courses]
  );
  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter(course => {
      const matchesCategory = category === 'All' || course.category === category;
      const searchableText = [
        course.title,
        course.provider,
        course.description,
        ...(course.required_skills || []).map(skill => skill.skill_name),
      ].join(' ').toLowerCase();
      return matchesCategory && searchableText.includes(normalizedQuery);
    });
  }, [category, courses, query]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>LEARN WITH PURPOSE</span>
          <h1>Course Catalog</h1>
          <p>Explore courses linked to the skills in your profile.</p>
        </div>
        <Link href="/recommendations" className="btn btn-primary">View my recommendations</Link>
      </header>

      <div className={styles.filters}>
        <label className={styles.searchLabel}>
          <span>Search courses and skills</span>
          <input
            className="form-control"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Try Python, cloud, or data"
          />
        </label>
        <label className={styles.categoryLabel}>
          <span>Category</span>
          <select className="form-control" value={category} onChange={event => setCategory(event.target.value)}>
            {categories.map(value => <option key={value}>{value}</option>)}
          </select>
        </label>
      </div>

      {filteredCourses.length === 0 ? (
        <p className={styles.empty}>No courses match those filters.</p>
      ) : (
        <div className={styles.grid}>
          {filteredCourses.map(course => (
            <article key={course.course_id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.category}>{course.category}</span>
                <span className={styles.difficulty}>{course.difficulty_level}</span>
              </div>
              <h2>{course.title}</h2>
              <p className={styles.provider}>{course.provider} · {course.duration}</p>
              <p className={styles.description}>{course.description}</p>
              <div className={styles.skills}>
                <strong>Skills covered</strong>
                <div>
                  {(course.required_skills || []).map(skill => (
                    <span key={skill.skill_id}>
                      {skill.skill_name} <small>{skill.required_proficiency}</small>
                    </span>
                  ))}
                </div>
              </div>
              <a href={course.course_url} target="_blank" rel="noreferrer" className={styles.courseLink}>
                Visit provider <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

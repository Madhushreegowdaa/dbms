'use client';
import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '../lib/supabase/client';
import { PageEnter, StaggerContainer, StaggerItem } from './Animate';
import styles from './SkillsManager.module.css';

const PROFICIENCY = ['Beginner','Intermediate','Advanced'];

export default function SkillsManager({ allSkills, studentSkills, studentId, hasProfile }) {
  const [mySkills, setMySkills] = useState(studentSkills);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [tab, setTab]           = useState('browse');
  const [loadingSkills, setLoadingSkills] = useState(() => new Set());
  const [editId, setEditId]     = useState(null);
  const [editProf, setEditProf] = useState('Beginner');
  const [addProf, setAddProf]   = useState({});
  const [toast, setToast]       = useState(null);
  const pendingSkillIds = useRef(new Set());
  const categories = useMemo(
    () => ['All', ...new Set(allSkills.map(skill => skill.category).filter(Boolean))],
    [allSkills]
  );

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const mySkillIds = useMemo(() => new Set(mySkills.map(s => s.skill_id)), [mySkills]);

  const filtered = useMemo(() => allSkills.filter(s => {
    const matchCat = category === 'All' || s.category === category;
    const matchQ   = s.skill_name.toLowerCase().includes(search.toLowerCase()) ||
                     s.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  }), [allSkills, category, search]);

  const mySkillsFull = useMemo(() =>
    mySkills.map(ms => ({ ...ms, skill: allSkills.find(s => s.skill_id === ms.skill_id) })).filter(ms => ms.skill),
  [mySkills, allSkills]);

  async function runSkillMutation(skillId, mutation, onSuccess, successMessage) {
    if (pendingSkillIds.current.has(skillId)) return;

    pendingSkillIds.current.add(skillId);
    setLoadingSkills(current => new Set(current).add(skillId));
    try {
      const { error } = await mutation(createClient());
      if (error) return showToast(error.message, 'error');
      onSuccess();
      showToast(successMessage);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Could not update your skills. Please try again.',
        'error'
      );
    } finally {
      pendingSkillIds.current.delete(skillId);
      setLoadingSkills(current => {
        const next = new Set(current);
        next.delete(skillId);
        return next;
      });
    }
  }

  async function addSkill(skillId) {
    if (!hasProfile) return showToast('Please create your profile first.', 'error');
    const prof = addProf[skillId] || 'Beginner';
    if (!studentId) return showToast('Please create your profile first.', 'error');
    await runSkillMutation(
      skillId,
      supabase => supabase.from('student_skills').insert({
        student_id: studentId,
        skill_id: skillId,
        proficiency_level: prof,
      }),
      () => setMySkills(prev => [...prev, { skill_id: skillId, proficiency_level: prof }]),
      'Skill added!'
    );
  }

  async function removeSkill(skillId) {
    if (!studentId) return showToast('Student profile not found.', 'error');
    await runSkillMutation(
      skillId,
      supabase => supabase.from('student_skills')
        .delete()
        .eq('student_id', studentId)
        .eq('skill_id', skillId),
      () => setMySkills(prev => prev.filter(s => s.skill_id !== skillId)),
      'Skill removed.'
    );
  }

  async function saveEdit(skillId) {
    if (!studentId) return showToast('Student profile not found.', 'error');
    const currentSkill = mySkills.find(skill => skill.skill_id === skillId);
    if (currentSkill?.proficiency_level === editProf) {
      setEditId(null);
      return;
    }
    await runSkillMutation(
      skillId,
      supabase => supabase.from('student_skills')
        .update({ proficiency_level: editProf })
        .eq('student_id', studentId)
        .eq('skill_id', skillId),
      () => {
        setMySkills(prev => prev.map(skill =>
          skill.skill_id === skillId ? { ...skill, proficiency_level: editProf } : skill
        ));
        setEditId(null);
      },
      'Proficiency updated!'
    );
  }

  return (
    <PageEnter>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Skill Management</h1>
          <p className="text-muted">Browse the skills catalog and build your personal skill stack.</p>
        </div>
        <motion.div
          className={styles.counts}
          key={mySkills.length}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span className={styles.countBadge}>{mySkills.length} skills added</span>
        </motion.div>
      </div>

      <div className={styles.skillTicker} aria-hidden="true">
        <div className={styles.skillTickerTrack}>
          {[...categories.filter(c => c !== 'All'), ...categories.filter(c => c !== 'All')].map((categoryName, i) => (
            <span key={`${categoryName}-${i}`} className={styles.skillTickerItem}>
              {categoryName} <b>✦</b>
            </span>
          ))}
        </div>
      </div>

      {!hasProfile && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          You need to <Link href="/profile" style={{ fontWeight: 700, textDecoration: 'underline' }}>create your profile</Link> before adding skills.
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { id: 'browse', label: `🔍 Browse Skills (${allSkills.length})` },
          { id: 'mine',   label: `⭐ My Skills (${mySkills.length})` },
        ].map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.controls}>
              <input
                className={`form-control ${styles.search}`}
                placeholder="🔍  Search skills…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className={styles.catFilters}>
                {categories.map(c => (
                  <motion.button
                    key={c}
                    className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
                    onClick={() => setCategory(c)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {c}
                  </motion.button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <motion.p
                className="text-muted text-center"
                style={{ padding: '3rem 0' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No skills match your search.
              </motion.p>
            ) : (
              <StaggerContainer className="grid-3" stagger={0.05} delay={0}>
                {filtered.map(skill => {
                  const added = mySkillIds.has(skill.skill_id);
                  const isLoading = loadingSkills.has(skill.skill_id);
                  return (
                    <StaggerItem key={skill.skill_id}>
                      <motion.div
                        className={`card ${styles.skillCard} ${added ? styles.skillAdded : ''}`}
                        whileHover={{ y: -4, boxShadow: '0 1rem 2.5rem rgba(0,0,0,.12)' }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <div className={styles.skillTop}>
                          <span className={styles.skillCatTag}>{skill.category}</span>
                          <AnimatePresence>
                            {added && (
                              <motion.span
                                className="badge badge-advanced"
                                style={{ fontSize: '.7rem' }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                              >
                                ✓ Added
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        <h3 className={styles.skillName}>{skill.skill_name}</h3>
                        {skill.description && <p className={styles.skillDesc}>{skill.description}</p>}

                        {!added ? (
                          <div className={styles.addRow}>
                            <select
                              className={`form-control ${styles.profSelect}`}
                              value={addProf[skill.skill_id] || 'Beginner'}
                              onChange={e => setAddProf(p => ({ ...p, [skill.skill_id]: e.target.value }))}
                              disabled={isLoading}
                            >
                              {PROFICIENCY.map(p => <option key={p}>{p}</option>)}
                            </select>
                            <motion.button
                              className="btn btn-primary btn-sm"
                              onClick={() => addSkill(skill.skill_id)}
                              disabled={isLoading || !hasProfile}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isLoading ? <span className="spinner" /> : '+ Add'}
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            className="btn btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b', marginTop: '.5rem' }}
                            onClick={() => removeSkill(skill.skill_id)}
                            disabled={isLoading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {isLoading ? <span className="spinner spinner-dark" /> : '✕ Remove'}
                          </motion.button>
                        )}
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </motion.div>
        )}

        {tab === 'mine' && (
          <motion.div
            key="mine"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {mySkillsFull.length === 0 ? (
              <motion.div
                className={styles.emptyMine}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p style={{ fontSize: '3rem' }}>🛠️</p>
                <p>You haven&apos;t added any skills yet.</p>
                <button className="btn btn-primary mt-2" onClick={() => setTab('browse')}>Browse Skills</button>
              </motion.div>
            ) : (
              <StaggerContainer className="grid-3" stagger={0.06} delay={0}>
                <AnimatePresence>
                  {mySkillsFull.map(({ skill, skill_id, proficiency_level }) => {
                    const isEditing = editId === skill_id;
                    const isLoading = loadingSkills.has(skill_id);
                    return (
                      <StaggerItem key={skill_id}>
                        <motion.div
                          className={`card ${styles.mySkillCard}`}
                          layout
                          whileHover={{ y: -4, boxShadow: '0 1rem 2.5rem rgba(0,0,0,.12)' }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={styles.skillTop}>
                            <span className={styles.skillCatTag}>{skill.category}</span>
                            <motion.span
                              key={proficiency_level}
                              className={`badge badge-${proficiency_level.toLowerCase()}`}
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                            >
                              {proficiency_level}
                            </motion.span>
                          </div>
                          <h3 className={styles.skillName}>{skill.skill_name}</h3>

                          <AnimatePresence mode="wait">
                            {isEditing ? (
                              <motion.div
                                key="edit"
                                className={styles.editRow}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <select
                                  className={`form-control ${styles.profSelect}`}
                                  value={editProf}
                                  onChange={e => setEditProf(e.target.value)}
                                  disabled={isLoading}
                                >
                                  {PROFICIENCY.map(p => <option key={p}>{p}</option>)}
                                </select>
                                <div style={{ display: 'flex', gap: '.4rem' }}>
                                  <button className="btn btn-primary btn-sm" onClick={() => saveEdit(skill_id)} disabled={isLoading}>
                                    {isLoading ? <span className="spinner" /> : 'Save'}
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" onClick={() => setEditId(null)} disabled={isLoading}>Cancel</button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="actions"
                                className={styles.myActions}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <motion.button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => { setEditId(skill_id); setEditProf(proficiency_level); }}
                                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                >
                                  ✏️ Edit
                                </motion.button>
                                <motion.button
                                  className="btn btn-sm"
                                  style={{ background: '#fee2e2', color: '#991b1b' }}
                                  onClick={() => removeSkill(skill_id)}
                                  disabled={isLoading}
                                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                >
                                  {isLoading ? <span className="spinner spinner-dark" /> : '🗑 Remove'}
                                </motion.button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </StaggerItem>
                    );
                  })}
                </AnimatePresence>
              </StaggerContainer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageEnter>
  );
}

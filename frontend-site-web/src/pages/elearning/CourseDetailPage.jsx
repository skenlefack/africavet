import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { elearningApi, getImageUrl as resolveImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    loadCourse();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);

    let res;
    if (isAuthenticated) {
      res = await elearningApi.getCourseBySlug(slug);
    } else {
      res = await elearningApi.getCourseBySlugPublic(slug);
    }

    if (res.success && res.data) {
      setCourse(res.data);
      setEnrolled(!!res.data.enrolled);

      // Open the first module by default
      if (res.data.modules && res.data.modules.length > 0) {
        setOpenModules({ 0: true });
      }

      // Load progress if enrolled
      if (res.data.enrolled && isAuthenticated) {
        const progressRes = await elearningApi.getCourseProgress(res.data.id, token);
        if (progressRes.success) {
          setProgress(progressRes.data);
        }
      }
    } else {
      setError(res.message || 'Formation introuvable.');
    }

    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/connexion', { state: { from: `/formations/${slug}` } });
      return;
    }

    setEnrolling(true);
    const res = await elearningApi.enrollCourse(course.id, token);
    if (res.success) {
      setEnrolled(true);
      // Reload course to get updated data
      loadCourse();
    } else {
      alert(res.message || "Erreur lors de l'inscription.");
    }
    setEnrolling(false);
  };

  const toggleModule = (index) => {
    setOpenModules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getImageUrl = (path) => resolveImageUrl(path, 'https://via.placeholder.com/800x400/354e84/ffffff?text=Formation');

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const getLevelLabel = (level) => {
    const labels = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
    };
    return labels[level] || level || '';
  };

  // Build instructor display name
  const instructorName = course
    ? [course.instructor_first_name, course.instructor_last_name].filter(Boolean).join(' ') || course.instructor_name || null
    : null;

  // Parse JSON fields safely
  const parseJSON = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  const isLessonCompleted = (lessonId) => {
    if (!progress || !progress.completed_lessons) return false;
    return progress.completed_lessons.includes(lessonId);
  };

  const getFirstIncompleteLessonId = () => {
    if (!course?.modules || !progress?.completed_lessons) return null;
    for (const mod of course.modules) {
      if (mod.lessons) {
        for (const lesson of mod.lessons) {
          if (!progress.completed_lessons.includes(lesson.id)) {
            return lesson.id;
          }
        }
      }
    }
    return null;
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement de la formation..." />;
  }

  if (error || !course) {
    return (
      <div className="course-detail">
        <div className="container text-center py-5">
          <FontAwesome name="exclamation-triangle" style={{ fontSize: 48, color: '#ccc' }} />
          <h3 className="mt-3" style={{ color: '#888' }}>{error || 'Formation introuvable'}</h3>
          <Link to="/formations" className="btn btn-outline-secondary mt-3">
            <FontAwesome name="arrow-left" /> Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules
    ? course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0)
    : course.lessons_count || 0;

  const completedLessons = progress?.completed_lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="course-detail">
      {/* Hero Banner */}
      <section className="course-hero">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="course-hero__breadcrumb">
                <Link to="/">Accueil</Link>
                {' / '}
                <Link to="/formations">Formations</Link>
                {' / '}
                <span>{course.title_fr || course.title}</span>
              </div>

              {course.category_name && (
                <div className="course-hero__category">
                  {course.category_name}
                </div>
              )}

              <h1>{course.title_fr || course.title}</h1>

              {(course.description_fr || course.description) && (
                <p className="course-hero__desc">
                  {course.description_fr || course.description}
                </p>
              )}

              <div className="course-hero__meta">
                {instructorName && (
                  <div className="meta-item">
                    <FontAwesome name="user" />
                    <span>{instructorName}</span>
                  </div>
                )}
                {course.level && (
                  <div className="meta-item">
                    <FontAwesome name="signal" />
                    <span>{getLevelLabel(course.level)}</span>
                  </div>
                )}
                {(course.duration_hours || course.duration) && (
                  <div className="meta-item">
                    <FontAwesome name="clock-o" />
                    <span>{course.duration_hours || course.duration}h de formation</span>
                  </div>
                )}
                <div className="meta-item">
                  <FontAwesome name="book" />
                  <span>{totalLessons} leçons</span>
                </div>
                {course.modules && (
                  <div className="meta-item">
                    <FontAwesome name="th-list" />
                    <span>{course.modules.length} modules</span>
                  </div>
                )}
                {(course.enrolled_count > 0 || course.enrollment_count > 0) && (
                  <div className="meta-item">
                    <FontAwesome name="users" />
                    <span>{course.enrolled_count || course.enrollment_count} inscrits</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        <div className="row">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Ce que vous apprendrez */}
            {parseJSON(course.what_you_will_learn).length > 0 && (
              <section className="course-info-section" style={{ background: '#f0faf0', border: '1px solid #d4edda', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#354e84', marginBottom: 16 }}>
                  <FontAwesome name="check-circle" style={{ color: '#7ac142', marginRight: 8 }} />
                  Ce que vous apprendrez
                </h2>
                <div className="row">
                  {parseJSON(course.what_you_will_learn).map((item, i) => (
                    <div key={i} className="col-md-6" style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <FontAwesome name="check" style={{ color: '#7ac142', marginTop: 4, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: '#444' }}>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Prérequis + Public cible + Durée/Matériel en cards */}
            <div className="row" style={{ marginBottom: 24 }}>
              {/* Prérequis */}
              {parseJSON(course.requirements).length > 0 && (
                <div className="col-md-6" style={{ marginBottom: 16 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '20px 24px', height: '100%' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#354e84', marginBottom: 14 }}>
                      <FontAwesome name="graduation-cap" style={{ color: '#e67e22', marginRight: 8 }} />
                      Prérequis
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {parseJSON(course.requirements).map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 14, color: '#555' }}>
                          <FontAwesome name="angle-right" style={{ color: '#e67e22', marginTop: 3, flexShrink: 0 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Public cible */}
              {parseJSON(course.target_audience).length > 0 && (
                <div className="col-md-6" style={{ marginBottom: 16 }}>
                  <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '20px 24px', height: '100%' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#354e84', marginBottom: 14 }}>
                      <FontAwesome name="users" style={{ color: '#3498db', marginRight: 8 }} />
                      Public cible
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {parseJSON(course.target_audience).map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 14, color: '#555' }}>
                          <FontAwesome name="angle-right" style={{ color: '#3498db', marginTop: 3, flexShrink: 0 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Durée et Matériel */}
            <div className="row" style={{ marginBottom: 24 }}>
              <div className="col-md-6" style={{ marginBottom: 16 }}>
                <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '20px 24px', height: '100%' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#354e84', marginBottom: 14 }}>
                    <FontAwesome name="clock-o" style={{ color: '#9b59b6', marginRight: 8 }} />
                    Durée et rythme
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: '#555' }}>
                    <li style={{ marginBottom: 8 }}>
                      <strong>Durée totale :</strong> {course.duration_hours || course.duration || '—'}h
                    </li>
                    {course.estimated_weeks && (
                      <li style={{ marginBottom: 8 }}>
                        <strong>Durée estimée :</strong> {course.estimated_weeks} semaines
                      </li>
                    )}
                    <li style={{ marginBottom: 8 }}>
                      <strong>Modules :</strong> {course.modules?.length || 0}
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <strong>Leçons :</strong> {totalLessons}
                    </li>
                    <li>
                      <strong>Rythme :</strong> À votre propre rythme, 100% en ligne
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6" style={{ marginBottom: 16 }}>
                <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '20px 24px', height: '100%' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#354e84', marginBottom: 14 }}>
                    <FontAwesome name="laptop" style={{ color: '#2ecc71', marginRight: 8 }} />
                    Matériel requis
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: '#555' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FontAwesome name="check" style={{ color: '#2ecc71' }} /> Ordinateur, tablette ou smartphone
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FontAwesome name="check" style={{ color: '#2ecc71' }} /> Connexion internet stable
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FontAwesome name="check" style={{ color: '#2ecc71' }} /> Navigateur web à jour
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FontAwesome name="check" style={{ color: '#2ecc71' }} /> De quoi prendre des notes
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Curriculum */}
            {course.modules && course.modules.length > 0 && (
              <section className="curriculum-section">
                <h2 className="section-title">
                  <FontAwesome name="list-ol" /> Programme de la formation
                </h2>

                <div className="module-accordion">
                  {course.modules.map((mod, index) => (
                    <div
                      key={mod.id || index}
                      className={`module-item ${openModules[index] ? 'open' : ''}`}
                    >
                      <div
                        className="module-header"
                        onClick={() => toggleModule(index)}
                      >
                        <div className="module-info">
                          <div className="module-number">{index + 1}</div>
                          <h4>{mod.title_fr || mod.title}</h4>
                        </div>
                        <div className="module-meta">
                          <span>{mod.lessons?.length || 0} lecons</span>
                          <FontAwesome name="chevron-down" />
                        </div>
                      </div>

                      {openModules[index] && mod.lessons && (
                        <ul className="module-lessons">
                          {mod.lessons.map((lesson) => {
                            const completed = isLessonCompleted(lesson.id);
                            return (
                              <li key={lesson.id} className="lesson-item">
                                <div className={`lesson-info ${completed ? 'completed' : ''}`}>
                                  {completed ? (
                                    <FontAwesome name="check-circle" />
                                  ) : lesson.type === 'video' ? (
                                    <FontAwesome name="play-circle" />
                                  ) : lesson.type === 'pdf' ? (
                                    <FontAwesome name="file-pdf-o" />
                                  ) : (
                                    <FontAwesome name="file-text-o" />
                                  )}
                                  {enrolled ? (
                                    <Link
                                      to={`/formations/${slug}/lecon/${lesson.id}`}
                                      style={{ color: 'inherit', textDecoration: 'none' }}
                                    >
                                      {lesson.title_fr || lesson.title}
                                    </Link>
                                  ) : (
                                    <span>{lesson.title_fr || lesson.title}</span>
                                  )}
                                </div>
                                {lesson.duration && (
                                  <span className="lesson-duration">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Instructor Bio */}
            {(instructorName || course.instructor_bio_fr || course.instructor_bio) && (
              <section className="instructor-section">
                <h2 className="section-title" style={{ marginBottom: 20 }}>
                  <FontAwesome name="user-circle" /> Formateur
                </h2>
                <div className="instructor-card">
                  <div className="instructor-avatar">
                    {instructorName
                      ? instructorName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'F'}
                  </div>
                  <div className="instructor-info">
                    <h4>{instructorName || 'Formateur AfricaVET'}</h4>
                    {(course.instructor_title_fr || course.instructor_title) && (
                      <p className="instructor-title">{course.instructor_title_fr || course.instructor_title}</p>
                    )}
                    {(course.instructor_bio_fr || course.instructor_bio) && (
                      <p className="instructor-bio">
                        {course.instructor_bio_fr || course.instructor_bio}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-lg-4 course-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-card__image">
                <img
                  src={getImageUrl(course.thumbnail || course.image)}
                  alt={course.title_fr || course.title}
                />
              </div>

              <div className="sidebar-card__body">
                {course.price ? (
                  <div className="price-tag">
                    {Number(course.price).toLocaleString('fr-FR')} FCFA
                  </div>
                ) : (
                  <div className="price-tag free">Gratuit</div>
                )}

                {enrolled ? (
                  <>
                    {/* Progress */}
                    <div style={{ marginBottom: 16 }}>
                      <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${progressPercent}%`,
                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <small style={{ color: '#888' }}>
                        {progressPercent}% termine - {completedLessons}/{totalLessons} lecons
                      </small>
                    </div>

                    {getFirstIncompleteLessonId() ? (
                      <Link
                        to={`/formations/${slug}/lecon/${getFirstIncompleteLessonId()}`}
                        className="btn-enroll"
                        style={{ textDecoration: 'none' }}
                      >
                        <FontAwesome name="play" /> Continuer la formation
                      </Link>
                    ) : (
                      <button className="btn-continue" disabled>
                        <FontAwesome name="check" /> Formation terminee
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    className="btn-enroll"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        <FontAwesome name="sign-in" />
                        {isAuthenticated ? "S'inscrire a la formation" : 'Se connecter pour s\'inscrire'}
                      </>
                    )}
                  </button>
                )}

                <ul className="sidebar-info">
                  {course.level && (
                    <li>
                      <span><FontAwesome name="signal" /> Niveau</span>
                      <span>{getLevelLabel(course.level)}</span>
                    </li>
                  )}
                  <li>
                    <span><FontAwesome name="book" /> Lecons</span>
                    <span>{totalLessons}</span>
                  </li>
                  {(course.duration_hours || course.duration) && (
                    <li>
                      <span><FontAwesome name="clock-o" /> Durée</span>
                      <span>{course.duration_hours || course.duration}h</span>
                    </li>
                  )}
                  {course.estimated_weeks && (
                    <li>
                      <span><FontAwesome name="calendar" /> Semaines</span>
                      <span>{course.estimated_weeks}</span>
                    </li>
                  )}
                  {course.language && (
                    <li>
                      <span><FontAwesome name="globe" /> Langue</span>
                      <span>{course.language === 'fr' ? 'Francais' : course.language === 'en' ? 'Anglais' : course.language}</span>
                    </li>
                  )}
                  {course.has_certificate && (
                    <li>
                      <span><FontAwesome name="certificate" /> Certificat</span>
                      <span style={{ color: '#7ac142' }}>Oui</span>
                    </li>
                  )}
                  {course.enrollment_count !== undefined && (
                    <li>
                      <span><FontAwesome name="users" /> Inscrits</span>
                      <span>{course.enrollment_count}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;

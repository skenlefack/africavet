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
      debutant: 'Debutant',
      intermediaire: 'Intermediaire',
      avance: 'Avance',
    };
    return labels[level] || level || '';
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
                {course.instructor_name && (
                  <div className="meta-item">
                    <FontAwesome name="user" />
                    <span>{course.instructor_name}</span>
                  </div>
                )}
                {course.level && (
                  <div className="meta-item">
                    <FontAwesome name="signal" />
                    <span>{getLevelLabel(course.level)}</span>
                  </div>
                )}
                {course.duration && (
                  <div className="meta-item">
                    <FontAwesome name="clock-o" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                )}
                <div className="meta-item">
                  <FontAwesome name="book" />
                  <span>{totalLessons} lecons</span>
                </div>
                {course.enrollment_count !== undefined && (
                  <div className="meta-item">
                    <FontAwesome name="users" />
                    <span>{course.enrollment_count} inscrits</span>
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
          {/* Left Column - Curriculum */}
          <div className="col-lg-8">
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
            {(course.instructor_name || course.instructor_bio) && (
              <section className="instructor-section">
                <h2 className="section-title" style={{ marginBottom: 20 }}>
                  <FontAwesome name="user-circle" /> Formateur
                </h2>
                <div className="instructor-card">
                  <div className="instructor-avatar">
                    {course.instructor_name
                      ? course.instructor_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'F'}
                  </div>
                  <div className="instructor-info">
                    <h4>{course.instructor_name || 'Formateur AfricaVet'}</h4>
                    {course.instructor_title && (
                      <p className="instructor-title">{course.instructor_title}</p>
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
                  {course.duration && (
                    <li>
                      <span><FontAwesome name="clock-o" /> Duree</span>
                      <span>{formatDuration(course.duration)}</span>
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

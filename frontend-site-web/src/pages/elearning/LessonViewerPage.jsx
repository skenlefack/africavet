import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { elearningApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const LessonViewerPage = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadLesson();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonId, slug]);

  const loadLesson = async () => {
    setLoading(true);
    setError(null);

    // Load lesson data
    const lessonRes = await elearningApi.getLesson(lessonId, token);
    if (lessonRes.success && lessonRes.data) {
      setLesson(lessonRes.data);

      // Load course data for sidebar navigation
      const courseRes = await elearningApi.getCourseBySlug(slug);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);

        // Load progress
        const progressRes = await elearningApi.getCourseProgress(courseRes.data.id, token);
        if (progressRes.success) {
          setProgress(progressRes.data);
        }
      }
    } else {
      setError(lessonRes.message || 'Lecon introuvable.');
    }

    setLoading(false);
  };

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);

    const res = await elearningApi.completeLesson(lessonId, token);
    if (res.success) {
      // Update progress locally
      setProgress((prev) => {
        if (!prev) return { completed_lessons: [parseInt(lessonId)] };
        const completed = [...(prev.completed_lessons || [])];
        if (!completed.includes(parseInt(lessonId))) {
          completed.push(parseInt(lessonId));
        }
        return { ...prev, completed_lessons: completed };
      });
    } else {
      alert(res.message || 'Erreur lors de la validation.');
    }

    setCompleting(false);
  };

  const isLessonCompleted = (id) => {
    if (!progress?.completed_lessons) return false;
    return progress.completed_lessons.includes(parseInt(id));
  };

  const isCurrentLessonCompleted = isLessonCompleted(lessonId);

  // Build flat list of lessons for prev/next navigation
  const allLessons = [];
  if (course?.modules) {
    course.modules.forEach((mod) => {
      if (mod.lessons) {
        mod.lessons.forEach((l) => {
          allLessons.push({ ...l, moduleName: mod.title_fr || mod.title });
        });
      }
    });
  }

  const currentIndex = allLessons.findIndex((l) => String(l.id) === String(lessonId));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const totalLessons = allLessons.length;
  const completedCount = progress?.completed_lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement de la lecon..." />;
  }

  if (error || !lesson) {
    return (
      <div className="container text-center py-5">
        <FontAwesome name="exclamation-triangle" style={{ fontSize: 48, color: '#ccc' }} />
        <h3 className="mt-3" style={{ color: '#888' }}>{error || 'Lecon introuvable'}</h3>
        <Link to={`/formations/${slug}`} className="btn btn-outline-secondary mt-3">
          <FontAwesome name="arrow-left" /> Retour a la formation
        </Link>
      </div>
    );
  }

  return (
    <div className="lesson-viewer">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="lesson-sidebar">
          <div className="sidebar-header">
            <h3>{course?.title_fr || course?.title || 'Formation'}</h3>
            <div className="sidebar-progress">
              <span>{progressPercent}% termine - {completedCount}/{totalLessons} lecons</span>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="sidebar-modules">
            {course?.modules?.map((mod, modIndex) => (
              <div key={mod.id || modIndex} className="sidebar-module">
                <div className="sidebar-module__title">
                  Module {modIndex + 1}: {mod.title_fr || mod.title}
                </div>
                {mod.lessons?.map((l) => {
                  const isActive = String(l.id) === String(lessonId);
                  const completed = isLessonCompleted(l.id);
                  return (
                    <Link
                      key={l.id}
                      to={`/formations/${slug}/lecon/${l.id}`}
                      className={`sidebar-lesson ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}
                    >
                      {completed ? (
                        <FontAwesome name="check-circle" />
                      ) : isActive ? (
                        <FontAwesome name="play-circle" />
                      ) : (
                        <FontAwesome name="circle-o" />
                      )}
                      <span className="sidebar-lesson__title">
                        {l.title_fr || l.title}
                      </span>
                      {l.duration && (
                        <span className="sidebar-lesson__duration">
                          {formatDuration(l.duration)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="lesson-content">
        {/* Header */}
        <div className="lesson-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="lesson-breadcrumb">
                <Link to={`/formations/${slug}`}>
                  <FontAwesome name="arrow-left" /> {course?.title_fr || course?.title}
                </Link>
                {lesson.module_title && (
                  <span> / {lesson.module_title}</span>
                )}
              </div>
              <h1>{lesson.title_fr || lesson.title}</h1>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary d-lg-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ whiteSpace: 'nowrap' }}
            >
              <FontAwesome name={sidebarOpen ? 'times' : 'bars'} /> Menu
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="lesson-body">
          {/* Video content */}
          {lesson.type === 'video' && lesson.video_url && (
            <div className="lesson-video">
              <iframe
                src={lesson.video_url}
                title={lesson.title_fr || lesson.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* PDF content */}
          {lesson.type === 'pdf' && lesson.pdf_url && (
            <iframe
              className="lesson-pdf"
              src={lesson.pdf_url}
              title={lesson.title_fr || lesson.title}
            />
          )}

          {/* Text / HTML content */}
          {(lesson.content_fr || lesson.content) && (
            <div
              className="lesson-text"
              dangerouslySetInnerHTML={{
                __html: lesson.content_fr || lesson.content,
              }}
            />
          )}

          {/* No content fallback */}
          {!lesson.video_url && !lesson.pdf_url && !lesson.content_fr && !lesson.content && (
            <div className="text-center py-5">
              <FontAwesome name="file-o" style={{ fontSize: 48, color: '#ccc' }} />
              <p className="mt-3" style={{ color: '#888' }}>
                Le contenu de cette lecon n'est pas encore disponible.
              </p>
            </div>
          )}
        </div>

        {/* Footer - Navigation & Complete */}
        <div className="lesson-footer">
          <button
            className={`btn-complete ${isCurrentLessonCompleted ? 'completed' : ''}`}
            onClick={handleComplete}
            disabled={completing || isCurrentLessonCompleted}
          >
            {completing ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                Validation...
              </>
            ) : isCurrentLessonCompleted ? (
              <>
                <FontAwesome name="check-circle" /> Lecon terminee
              </>
            ) : (
              <>
                <FontAwesome name="check" /> Marquer comme terminee
              </>
            )}
          </button>

          <div className="lesson-nav">
            {prevLesson && (
              <Link
                to={`/formations/${slug}/lecon/${prevLesson.id}`}
                className="btn-nav"
              >
                <FontAwesome name="arrow-left" /> Precedente
              </Link>
            )}
            {nextLesson ? (
              <Link
                to={`/formations/${slug}/lecon/${nextLesson.id}`}
                className="btn-nav"
              >
                Suivante <FontAwesome name="arrow-right" />
              </Link>
            ) : (
              // If there's a quiz, link to it
              course?.quiz_id && (
                <Link
                  to={`/formations/${slug}/quiz/${course.quiz_id}`}
                  className="btn-nav"
                  style={{ borderColor: '#7ac142', color: '#7ac142' }}
                >
                  Passer le quiz <FontAwesome name="pencil" />
                </Link>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonViewerPage;

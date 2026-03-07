import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { elearningApi, getImageUrl as resolveImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const LearningPathDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPath();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadPath = async () => {
    setLoading(true);
    setError(null);

    const res = await elearningApi.getLearningPathBySlug(slug);
    if (res.success && res.data) {
      setPath(res.data);
    } else {
      setError(res.message || 'Parcours introuvable.');
    }

    setLoading(false);
  };

  const getImageUrl = (imgPath) => resolveImageUrl(imgPath, 'https://via.placeholder.com/300x200/354e84/ffffff?text=Formation');

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

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement du parcours..." />;
  }

  if (error || !path) {
    return (
      <div className="container text-center py-5">
        <FontAwesome name="exclamation-triangle" style={{ fontSize: 48, color: '#ccc' }} />
        <h3 className="mt-3" style={{ color: '#888' }}>{error || 'Parcours introuvable'}</h3>
        <Link to="/parcours" className="btn btn-outline-secondary mt-3">
          <FontAwesome name="arrow-left" /> Retour aux parcours
        </Link>
      </div>
    );
  }

  const courses = path.courses || [];
  const totalDuration = path.total_duration || courses.reduce((sum, c) => sum + (c.duration || 0), 0);

  return (
    <div className="path-detail">
      {/* Hero */}
      <section className="path-hero">
        <div className="container">
          <div className="course-hero__breadcrumb" style={{ fontSize: 14, marginBottom: 20, opacity: 0.85 }}>
            <Link to="/" style={{ color: '#fff', opacity: 0.8 }}>Accueil</Link>
            {' / '}
            <Link to="/parcours" style={{ color: '#fff', opacity: 0.8 }}>Parcours</Link>
            {' / '}
            <span style={{ color: '#fff' }}>{path.title_fr || path.title}</span>
          </div>

          <h1>{path.title_fr || path.title}</h1>

          {(path.description_fr || path.description) && (
            <p className="path-hero__desc">
              {path.description_fr || path.description}
            </p>
          )}

          <div className="path-hero__meta">
            <div className="meta-item">
              <FontAwesome name="book" />
              <span>{courses.length} formation{courses.length !== 1 ? 's' : ''}</span>
            </div>
            {totalDuration > 0 && (
              <div className="meta-item">
                <FontAwesome name="clock-o" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            )}
            {path.level && (
              <div className="meta-item">
                <FontAwesome name="signal" />
                <span>{getLevelLabel(path.level)}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Courses List */}
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#333' }}>
              <FontAwesome name="list-ol" /> Formations du parcours
            </h2>

            {courses.length === 0 ? (
              <div className="text-center py-5">
                <FontAwesome name="book" style={{ fontSize: 48, color: '#ccc' }} />
                <p className="mt-3" style={{ color: '#888' }}>
                  Aucune formation dans ce parcours pour le moment.
                </p>
              </div>
            ) : (
              <div className="path-courses-list">
                {courses.map((course, index) => {
                  const courseProgress = course.progress || 0;

                  return (
                    <div key={course.id || index} className="path-course-item">
                      <div className="course-order">{index + 1}</div>

                      <div className="course-image">
                        <Link to={`/formations/${course.slug}`}>
                          <img
                            src={getImageUrl(course.thumbnail || course.image)}
                            alt={course.title_fr || course.title}
                          />
                        </Link>
                      </div>

                      <div className="course-info">
                        <h4>
                          <Link to={`/formations/${course.slug}`}>
                            {course.title_fr || course.title}
                          </Link>
                        </h4>
                        <div className="course-meta">
                          {course.duration && (
                            <span>
                              <FontAwesome name="clock-o" /> {formatDuration(course.duration)}
                            </span>
                          )}
                          {course.lessons_count !== undefined && (
                            <span>
                              <FontAwesome name="book" /> {course.lessons_count} lecons
                            </span>
                          )}
                          {course.level && (
                            <span>
                              <FontAwesome name="signal" /> {getLevelLabel(course.level)}
                            </span>
                          )}
                        </div>

                        {/* Progress bar if enrolled */}
                        {courseProgress > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div className="progress" style={{ height: 6, borderRadius: 3 }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${courseProgress}%`,
                                  background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                            <small style={{ color: '#888', fontSize: 11 }}>
                              {courseProgress}% termine
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="course-progress-badge">
                        {courseProgress >= 100 ? (
                          <span className="badge-complete">
                            <FontAwesome name="check" /> Termine
                          </span>
                        ) : courseProgress > 0 ? (
                          <span className="badge-complete" style={{ background: 'rgba(53, 78, 132, 0.1)', color: '#354e84' }}>
                            En cours
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 100,
              }}
            >
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                Resume du parcours
              </h4>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#555' }}>
                  <span><FontAwesome name="book" /> Formations</span>
                  <span style={{ fontWeight: 600, color: '#333' }}>{courses.length}</span>
                </li>
                {totalDuration > 0 && (
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#555' }}>
                    <span><FontAwesome name="clock-o" /> Duree totale</span>
                    <span style={{ fontWeight: 600, color: '#333' }}>{formatDuration(totalDuration)}</span>
                  </li>
                )}
                {path.level && (
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#555' }}>
                    <span><FontAwesome name="signal" /> Niveau</span>
                    <span style={{ fontWeight: 600, color: '#333' }}>{getLevelLabel(path.level)}</span>
                  </li>
                )}
                {path.has_certificate && (
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 14, color: '#555' }}>
                    <span><FontAwesome name="certificate" /> Certificat</span>
                    <span style={{ fontWeight: 600, color: '#7ac142' }}>Oui</span>
                  </li>
                )}
              </ul>

              <div style={{ marginTop: 20 }}>
                {courses.length > 0 && (
                  <Link
                    to={`/formations/${courses[0].slug}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                      color: '#fff',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: 'none',
                      transition: 'opacity 0.3s',
                    }}
                  >
                    <FontAwesome name="play" /> Commencer le parcours
                  </Link>
                )}
              </div>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Link to="/parcours" style={{ fontSize: 13, color: '#888' }}>
                  <FontAwesome name="arrow-left" /> Retour aux parcours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetailPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { elearningApi, getImageUrl as resolveImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import TabNav from '../../component/shared/TabNav';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const MyLearningPage = () => {
  const { token } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const [enrollRes, certRes] = await Promise.all([
      elearningApi.getMyEnrollments(token),
      elearningApi.getMyCertificates(token),
    ]);

    if (enrollRes.success) {
      setEnrollments(enrollRes.data || []);
    } else {
      setError(enrollRes.message || 'Erreur lors du chargement.');
    }

    if (certRes.success) {
      setCertificates(certRes.data || []);
    }

    setLoading(false);
  };

  const getImageUrl = (path) => resolveImageUrl(path, 'https://via.placeholder.com/400x250/354e84/ffffff?text=Formation');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Stats
  const inProgressCourses = enrollments.filter(
    (e) => (e.progress || 0) < 100
  );
  const completedCourses = enrollments.filter(
    (e) => (e.progress || 0) >= 100
  );

  const tabs = [
    {
      value: 'courses',
      label: 'Mes formations',
      icon: 'fa fa-book',
      count: enrollments.length,
    },
    {
      value: 'certificates',
      label: 'Mes certificats',
      icon: 'fa fa-certificate',
      count: certificates.length,
    },
  ];

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement de votre espace..." />;
  }

  return (
    <div className="my-learning">
      <div className="container">
        {/* Header */}
        <div className="my-learning__header">
          <h1>
            <FontAwesome name="graduation-cap" /> Mon apprentissage
          </h1>
        </div>

        {/* Stats */}
        <div className="my-learning__stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesome name="book" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{enrollments.length}</div>
              <div className="stat-label">Formations inscrites</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesome name="spinner" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{inProgressCourses.length}</div>
              <div className="stat-label">En cours</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesome name="check-circle" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{completedCourses.length}</div>
              <div className="stat-label">Terminees</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FontAwesome name="certificate" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{certificates.length}</div>
              <div className="stat-label">Certificats obtenus</div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            <FontAwesome name="exclamation-triangle" /> {error}
          </div>
        )}

        {/* Tabs */}
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <>
            {enrollments.length === 0 ? (
              <div className="text-center py-5">
                <FontAwesome name="book" style={{ fontSize: 48, color: '#ccc' }} />
                <h4 className="mt-3" style={{ color: '#888' }}>
                  Aucune formation en cours
                </h4>
                <p style={{ color: '#aaa' }}>
                  Parcourez notre catalogue pour trouver une formation qui vous interesse.
                </p>
                <Link
                  to="/formations"
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 8,
                  }}
                >
                  <FontAwesome name="search" /> Parcourir les formations
                </Link>
              </div>
            ) : (
              enrollments.map((enrollment) => {
                const progress = enrollment.progress || 0;
                const totalLessons = enrollment.total_lessons || 0;
                const completedLessons = enrollment.completed_lessons || 0;

                return (
                  <div key={enrollment.id || enrollment.course_id} className="enrollment-card">
                    <div className="enrollment-image">
                      <Link to={`/formations/${enrollment.slug}`}>
                        <img
                          src={getImageUrl(enrollment.thumbnail || enrollment.image)}
                          alt={enrollment.title_fr || enrollment.title}
                        />
                      </Link>
                    </div>
                    <div className="enrollment-body">
                      <h3>
                        <Link to={`/formations/${enrollment.slug}`}>
                          {enrollment.title_fr || enrollment.title}
                        </Link>
                      </h3>
                      {enrollment.instructor_name && (
                        <div className="enrollment-instructor">
                          <FontAwesome name="user" /> {enrollment.instructor_name}
                        </div>
                      )}

                      <div className="enrollment-progress">
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="progress-text">
                          <span>{progress}% termine</span>
                          <span>
                            {completedLessons}/{totalLessons} lecons
                          </span>
                        </div>
                      </div>

                      <div className="enrollment-actions">
                        {progress >= 100 ? (
                          <Link
                            to={`/formations/${enrollment.slug}`}
                            className="btn-continue-learning"
                            style={{ background: '#28a745' }}
                          >
                            <FontAwesome name="check-circle" /> Formation terminee
                          </Link>
                        ) : enrollment.next_lesson_id ? (
                          <Link
                            to={`/formations/${enrollment.slug}/lecon/${enrollment.next_lesson_id}`}
                            className="btn-continue-learning"
                          >
                            <FontAwesome name="play" /> Continuer
                          </Link>
                        ) : (
                          <Link
                            to={`/formations/${enrollment.slug}`}
                            className="btn-continue-learning"
                          >
                            <FontAwesome name="play" /> Reprendre
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="certificates-section">
            {certificates.length === 0 ? (
              <div className="text-center py-5">
                <FontAwesome name="certificate" style={{ fontSize: 48, color: '#ccc' }} />
                <h4 className="mt-3" style={{ color: '#888' }}>
                  Aucun certificat obtenu
                </h4>
                <p style={{ color: '#aaa' }}>
                  Completez une formation avec quiz pour obtenir votre certificat.
                </p>
              </div>
            ) : (
              <div className="row g-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="col-md-6 col-lg-4">
                    <div className="certificate-card">
                      <div className="certificate-icon">
                        <FontAwesome name="trophy" />
                      </div>
                      <h4>{cert.course_title_fr || cert.course_title}</h4>
                      <div className="certificate-date">
                        Obtenu le {formatDate(cert.issued_at || cert.created_at)}
                      </div>
                      {cert.score !== undefined && (
                        <div style={{ fontSize: 13, color: '#7ac142', fontWeight: 600, marginBottom: 8 }}>
                          Score: {cert.score}%
                        </div>
                      )}
                      <Link
                        to={`/certificat/verification/${cert.code || cert.verification_code}`}
                        className="btn-view-cert"
                      >
                        <FontAwesome name="external-link" /> Verifier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearningPage;

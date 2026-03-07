import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FontAwesome from "../../component/uiStyle/FontAwesome";
import LoadingSpinner from "../../component/shared/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { elearningApi } from "../../services/api";
import "./profile.scss";

const DashboardPage = () => {
  const { user, token } = useAuth();
  const { unreadCount } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    certificatesEarned: 0,
    applicationsSent: 0,
    notificationsUnread: 0,
  });

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  useEffect(() => {
    setStats(prev => ({ ...prev, notificationsUnread: unreadCount }));
  }, [unreadCount]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [enrollRes, certRes] = await Promise.all([
        elearningApi.getMyEnrollments(token),
        elearningApi.getMyCertificates(token),
      ]);

      if (enrollRes.success) {
        const data = Array.isArray(enrollRes.data) ? enrollRes.data : (enrollRes.data?.enrollments || []);
        setEnrollments(data);
        setStats(prev => ({ ...prev, coursesEnrolled: data.length }));
      }

      if (certRes.success) {
        const data = Array.isArray(certRes.data) ? certRes.data : (certRes.data?.certificates || []);
        setCertificates(data);
        setStats(prev => ({ ...prev, certificatesEarned: data.length }));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!user) return 0;
    const fields = [
      user.first_name, user.last_name, user.email, user.phone,
      user.profession, user.country, user.city, user.specialization,
      user.education_level, user.avatar, user.cv_filename,
    ];
    const filled = fields.filter(f => f && String(f).trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Get courses in progress (not completed)
  const getCoursesInProgress = () => {
    return enrollments.filter(e => {
      const progress = e.progress_percentage || e.progress || 0;
      return progress < 100;
    }).slice(0, 3);
  };

  // Relative time helper
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "A l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const profileCompletion = getProfileCompletion();
  const coursesInProgress = getCoursesInProgress();

  if (!user) {
    return <LoadingSpinner fullPage text="Chargement..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">

        {/* Welcome header */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <div className="welcome-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                <div className="welcome-avatar-placeholder">
                  <FontAwesome name="user" />
                </div>
              )}
            </div>
            <div className="welcome-text">
              <h1>Bienvenue, {user.first_name || "Utilisateur"} !</h1>
              <p>Voici un apercu de votre activite sur AfricaVet</p>
            </div>
          </div>
          <div className="welcome-actions">
            <Link to="/profil" className="btn-welcome-action">
              <FontAwesome name="pencil" /> Modifier mon profil
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="dashboard-stats">
          <div className="row">
            <div className="col-sm-6 col-lg-3">
              <div className="stat-card stat-courses">
                <div className="stat-icon">
                  <FontAwesome name="book" />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.coursesEnrolled}</span>
                  <span className="stat-label">Cours inscrits</span>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="stat-card stat-certificates">
                <div className="stat-icon">
                  <FontAwesome name="certificate" />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.certificatesEarned}</span>
                  <span className="stat-label">Certificats obtenus</span>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="stat-card stat-applications">
                <div className="stat-icon">
                  <FontAwesome name="paper-plane" />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.applicationsSent}</span>
                  <span className="stat-label">Candidatures envoyees</span>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <Link to="/notifications" className="stat-card stat-notifications" style={{ textDecoration: 'none' }}>
                <div className="stat-icon">
                  <FontAwesome name="bell" />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.notificationsUnread}</span>
                  <span className="stat-label">Notifications non lues</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Chargement de vos donnees..." />
        ) : (
          <div className="row">
            {/* Left column */}
            <div className="col-lg-8">

              {/* Profile completion */}
              {profileCompletion < 100 && (
                <div className="dashboard-card profile-completion-card">
                  <div className="dashboard-card-header">
                    <h3><FontAwesome name="user-circle" /> Completez votre profil</h3>
                    <span className="completion-percentage">{profileCompletion}%</span>
                  </div>
                  <div className="completion-bar-wrapper">
                    <div className="completion-bar">
                      <div
                        className="completion-bar-fill"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="completion-hint">
                    Un profil complet augmente votre visibilite aupres des recruteurs et ameliore les recommandations.
                  </p>
                  <Link to="/profil" className="btn-complete-profile">
                    <FontAwesome name="arrow-right" /> Completer mon profil
                  </Link>
                </div>
              )}

              {/* Continue Learning */}
              {coursesInProgress.length > 0 && (
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h3><FontAwesome name="play-circle" /> Continuer l'apprentissage</h3>
                    <Link to="/mon-apprentissage" className="card-header-link">Voir tout <FontAwesome name="angle-right" /></Link>
                  </div>
                  <div className="learning-list">
                    {coursesInProgress.map((enrollment) => {
                      const progress = enrollment.progress_percentage || enrollment.progress || 0;
                      return (
                        <div key={enrollment.id || enrollment.course_id} className="learning-item">
                          <div className="learning-thumb">
                            {enrollment.thumbnail || enrollment.course_thumbnail ? (
                              <img src={enrollment.thumbnail || enrollment.course_thumbnail} alt={enrollment.title || enrollment.course_title} />
                            ) : (
                              <div className="learning-thumb-placeholder">
                                <FontAwesome name="book" />
                              </div>
                            )}
                          </div>
                          <div className="learning-info">
                            <h4>{enrollment.title || enrollment.course_title || "Cours"}</h4>
                            <div className="learning-progress">
                              <div className="progress-bar-bg">
                                <div
                                  className="progress-bar-fill"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="progress-text">{Math.round(progress)}%</span>
                            </div>
                            {enrollment.next_lesson_title && (
                              <p className="next-lesson">
                                <FontAwesome name="arrow-right" /> {enrollment.next_lesson_title}
                              </p>
                            )}
                          </div>
                          <Link
                            to={enrollment.slug ? `/formations/${enrollment.slug || enrollment.course_slug}` : "/mon-apprentissage"}
                            className="btn-continue"
                          >
                            Continuer
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {certificates.length > 0 && (
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h3><FontAwesome name="certificate" /> Mes certificats</h3>
                  </div>
                  <div className="certificates-grid">
                    {certificates.slice(0, 4).map((cert) => (
                      <div key={cert.id} className="certificate-card-mini">
                        <div className="cert-icon">
                          <FontAwesome name="trophy" />
                        </div>
                        <div className="cert-info">
                          <h5>{cert.course_title || cert.title || "Certificat"}</h5>
                          <span className="cert-date">
                            <FontAwesome name="calendar" /> {cert.issued_at
                              ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                              : ""}
                          </span>
                          {cert.verification_code && (
                            <span className="cert-code">
                              Code : {cert.verification_code}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when nothing in progress */}
              {coursesInProgress.length === 0 && certificates.length === 0 && (
                <div className="dashboard-card">
                  <div className="dashboard-empty-state">
                    <div className="empty-icon">
                      <FontAwesome name="graduation-cap" />
                    </div>
                    <h3>Commencez votre parcours d'apprentissage</h3>
                    <p>Explorez notre catalogue de formations en sante animale et developpez vos competences.</p>
                    <Link to="/formations" className="btn-browse-courses">
                      <FontAwesome name="search" /> Parcourir les formations
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="col-lg-4">

              {/* Quick Actions */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3><FontAwesome name="bolt" /> Actions rapides</h3>
                </div>
                <div className="quick-actions-list">
                  <Link to="/formations" className="quick-action-item">
                    <div className="qa-icon qa-courses"><FontAwesome name="book" /></div>
                    <div className="qa-info">
                      <span className="qa-title">Parcourir les formations</span>
                      <span className="qa-desc">Decouvrez de nouvelles formations</span>
                    </div>
                    <FontAwesome name="angle-right" />
                  </Link>
                  <Link to="/opportunites" className="quick-action-item">
                    <div className="qa-icon qa-opportunities"><FontAwesome name="briefcase" /></div>
                    <div className="qa-info">
                      <span className="qa-title">Voir les opportunites</span>
                      <span className="qa-desc">Emplois et stages disponibles</span>
                    </div>
                    <FontAwesome name="angle-right" />
                  </Link>
                  <Link to="/alertes-veterinaires" className="quick-action-item">
                    <div className="qa-icon qa-alerts"><FontAwesome name="exclamation-triangle" /></div>
                    <div className="qa-info">
                      <span className="qa-title">Alertes veterinaires</span>
                      <span className="qa-desc">Dernieres alertes sanitaires</span>
                    </div>
                    <FontAwesome name="angle-right" />
                  </Link>
                  <Link to="/annuaire" className="quick-action-item">
                    <div className="qa-icon qa-directory"><FontAwesome name="address-book" /></div>
                    <div className="qa-info">
                      <span className="qa-title">Annuaire</span>
                      <span className="qa-desc">Trouvez des experts et organisations</span>
                    </div>
                    <FontAwesome name="angle-right" />
                  </Link>
                  <Link to="/profil" className="quick-action-item">
                    <div className="qa-icon qa-profile"><FontAwesome name="user" /></div>
                    <div className="qa-info">
                      <span className="qa-title">Mon profil</span>
                      <span className="qa-desc">Modifier mes informations</span>
                    </div>
                    <FontAwesome name="angle-right" />
                  </Link>
                </div>
              </div>

              {/* Recent activity */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h3><FontAwesome name="clock-o" /> Activite recente</h3>
                </div>
                <div className="activity-list">
                  {enrollments.slice(0, 5).map((enrollment, index) => {
                    const progress = enrollment.progress_percentage || enrollment.progress || 0;
                    return (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <FontAwesome name={progress >= 100 ? "check-circle" : "play-circle"} />
                        </div>
                        <div className="activity-info">
                          <p className="activity-text">
                            {progress >= 100 ? "Cours termine : " : "Inscrit au cours : "}
                            <strong>{enrollment.title || enrollment.course_title || "Cours"}</strong>
                          </p>
                          <span className="activity-time">{getRelativeTime(enrollment.enrolled_at || enrollment.updated_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {enrollments.length === 0 && (
                    <div className="activity-empty">
                      <FontAwesome name="info-circle" />
                      <p>Aucune activite recente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

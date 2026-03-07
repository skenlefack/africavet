import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { elearningApi } from '../../services/api';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import Pagination from '../../component/shared/Pagination';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const LearningPathsPage = () => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    loadPaths();
  }, [currentPage]);

  const loadPaths = async () => {
    setLoading(true);
    setError(null);

    const res = await elearningApi.getLearningPaths({
      page: currentPage,
      limit: itemsPerPage,
    });

    if (res.success) {
      setPaths(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } else {
      setError(res.message || 'Erreur lors du chargement des parcours.');
    }

    setLoading(false);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    return `${h}h`;
  };

  return (
    <div className="learning-paths">
      <div className="container">
        {/* Hero */}
        <div className="paths-hero">
          <h1>
            <FontAwesome name="road" /> Parcours d'apprentissage
          </h1>
          <p>
            Suivez un parcours structure pour maitriser un domaine complet. Chaque
            parcours regroupe plusieurs formations dans un ordre logique.
          </p>
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner text="Chargement des parcours..." />}

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            <FontAwesome name="exclamation-triangle" /> {error}
          </div>
        )}

        {/* Paths Grid */}
        {!loading && !error && (
          <>
            {paths.length === 0 ? (
              <div className="text-center py-5">
                <FontAwesome name="road" style={{ fontSize: 48, color: '#ccc' }} />
                <h4 className="mt-3" style={{ color: '#888' }}>
                  Aucun parcours disponible pour le moment
                </h4>
                <p style={{ color: '#aaa' }}>
                  De nouveaux parcours seront bientot ajoutes.
                </p>
                <Link to="/formations" className="btn btn-outline-secondary mt-2">
                  <FontAwesome name="arrow-left" /> Voir les formations
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {paths.map((path) => (
                  <div key={path.id} className="col-md-6 col-lg-4">
                    <Link
                      to={`/parcours/${path.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="path-card">
                        <div className="path-card__header">
                          <div className="path-card__icon">
                            <FontAwesome name="road" />
                          </div>
                          <h3>{path.title_fr || path.title}</h3>
                        </div>
                        <div className="path-card__body">
                          <p className="path-card__desc">
                            {path.description_fr || path.description || 'Parcours structure pour maitriser ce domaine.'}
                          </p>
                          <div className="path-card__meta">
                            <span>
                              <FontAwesome name="book" />{' '}
                              {path.courses_count || path.courses?.length || 0} formations
                            </span>
                            {path.total_duration && (
                              <span>
                                <FontAwesome name="clock-o" />{' '}
                                {formatDuration(path.total_duration)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LearningPathsPage;

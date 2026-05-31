import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import DocumentCard from '../../component/documents/DocumentCard';
import CategoryCard from '../../component/documents/CategoryCard';
import { documentsApi } from '../../services/api';
import './documents.scss';

const DocumentsLibraryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [statsRes, featuredRes, recentRes, catRes] = await Promise.all([
      documentsApi.getStats(),
      documentsApi.getFeatured(6),
      documentsApi.getRecent(8),
      documentsApi.getCategoriesTree(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (featuredRes.success) setFeatured(featuredRes.data || []);
    if (recentRes.success) setRecent(recentRes.data || []);
    if (catRes.success) setCategories((catRes.data || []).filter(c => c.is_active));
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/bibliotheque/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Only show parent categories for the grid
  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <div className="documents-page">
      {/* Hero Section */}
      <section className="doc-hero">
        <div className="container">
          <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              <FontAwesome name="home" /> Accueil
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>Bibliotheque documentaire</span>
          </nav>

          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>
            <FontAwesome name="book" /> Bibliotheque Documentaire
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '25px', maxWidth: '600px' }}>
            Accedez a une collection de documents techniques, rapports, guides et publications sur la sante animale en Afrique.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hero-search" style={{ marginBottom: '25px' }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un document..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-warning">
                  <FontAwesome name="search" /> Rechercher
                </button>
              </div>
            </div>
          </form>

          {/* Stats */}
          {stats && (
            <div className="row">
              <div className="col-6 col-md-3 mb-2">
                <div className="stat-pill">
                  <div className="stat-pill-number">{stats.total || 0}</div>
                  <div className="stat-pill-label">Documents</div>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="stat-pill">
                  <div className="stat-pill-number">{stats.totalCategories || 0}</div>
                  <div className="stat-pill-label">Categories</div>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="stat-pill">
                  <div className="stat-pill-number">{stats.totalDownloads || 0}</div>
                  <div className="stat-pill-label">Telechargements</div>
                </div>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="stat-pill">
                  <div className="stat-pill-number">{stats.totalCountries || 0}</div>
                  <div className="stat-pill-label">Pays</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Documents */}
      {featured.length > 0 && (
        <section style={{ padding: '40px 0 20px' }}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="section-title" style={{ marginBottom: '0' }}>
                <FontAwesome name="star" /> Documents a la une
              </h3>
              <Link to="/bibliotheque/recherche" className="btn btn-outline-secondary btn-sm">
                Voir tout <FontAwesome name="angle-right" />
              </Link>
            </div>
            <div className="row">
              {featured.map(doc => (
                <div key={doc.id} className="col-lg-4 col-md-6 mb-3">
                  <DocumentCard document={doc} layout="grid" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      {parentCategories.length > 0 && (
        <section style={{ padding: '30px 0', background: '#f8f9fa' }}>
          <div className="container">
            <h3 className="section-title">
              <FontAwesome name="folder-open-o" /> Categories
            </h3>
            <div className="row">
              {parentCategories.map(cat => (
                <div key={cat.id} className="col-lg-3 col-md-4 col-6 mb-3">
                  <CategoryCard category={cat} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Documents */}
      {recent.length > 0 && (
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="section-title" style={{ marginBottom: '0' }}>
                <FontAwesome name="clock-o" /> Documents recents
              </h3>
              <Link to="/bibliotheque/recherche?sort=recent" className="btn btn-outline-secondary btn-sm">
                Voir tout <FontAwesome name="angle-right" />
              </Link>
            </div>
            <div className="row">
              {recent.slice(0, 4).map(doc => (
                <div key={doc.id} className="col-lg-3 col-md-6 mb-3">
                  <DocumentCard document={doc} layout="grid" />
                </div>
              ))}
            </div>
            {recent.length > 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {recent.slice(4).map(doc => (
                  <DocumentCard key={doc.id} document={doc} layout="list" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA section */}
      <section style={{ padding: '40px 0', background: 'linear-gradient(135deg, #354e84 0%, #7ac142 100%)', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h3 style={{ fontWeight: '700', marginBottom: '10px' }}>Vous cherchez un document specifique ?</h3>
          <p style={{ opacity: 0.9, marginBottom: '20px' }}>
            Utilisez notre recherche avancee pour trouver exactement ce dont vous avez besoin.
          </p>
          <Link
            to="/bibliotheque/recherche"
            className="btn btn-light btn-lg"
            style={{ borderRadius: '25px', fontWeight: '600' }}
          >
            <FontAwesome name="search" /> Recherche avancee
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DocumentsLibraryPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { opportunitiesApi } from '../../services/api';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import Pagination from '../../component/shared/Pagination';
import OpportunityCard from '../../component/opportunities/OpportunityCard';

const TYPE_TABS = [
  { value: '', label: 'Tous', icon: 'th-large' },
  { value: 'emploi', label: 'Emplois', icon: 'briefcase' },
  { value: 'appel_offre', label: "Appels d'offres", icon: 'gavel' },
  { value: 'marche', label: 'March\u00e9s', icon: 'handshake-o' },
  { value: 'bourse', label: 'Bourses', icon: 'graduation-cap' },
];

const OpportunitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({ total: 0, emploi: 0, appel_offre: 0, marche: 0, bourse: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const activeType = searchParams.get('type') || '';
  const searchQuery = searchParams.get('search') || '';
  const countryFilter = searchParams.get('country') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      const res = await opportunitiesApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    };
    loadStats();
  }, []);

  // Load opportunities
  useEffect(() => {
    loadOpportunities();
  }, [activeType, searchQuery, countryFilter, currentPage]);

  const loadOpportunities = async () => {
    setLoading(true);
    const params = { page: currentPage, limit: 12 };
    if (activeType) params.type = activeType;
    if (searchQuery) params.search = searchQuery;
    if (countryFilter) params.country = countryFilter;

    const res = await opportunitiesApi.getAll(params);
    if (res.success) {
      setOpportunities(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    }
    setLoading(false);
  };

  const updateParams = useCallback((newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newParams };
    // Remove empty values
    Object.keys(updated).forEach(key => {
      if (!updated[key]) delete updated[key];
    });
    setSearchParams(updated);
  }, [searchParams, setSearchParams]);

  const handleTypeChange = (type) => {
    updateParams({ type, page: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value) => {
    updateParams({ search: value, page: '' });
  };

  const handleCountryChange = (value) => {
    updateParams({ country: value, page: '' });
  };

  const handlePageChange = (page) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="opportunities-page">
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          padding: '40px 0 30px',
          color: '#fff',
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              <FontAwesome name="home" /> Accueil
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>Opportunit\u00e9s</span>
          </nav>

          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>
            <FontAwesome name="briefcase" /> Opportunit\u00e9s
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '25px' }}>
            D\u00e9couvrez les derni\u00e8res offres d'emploi, appels d'offres, march\u00e9s et bourses dans le domaine v\u00e9t\u00e9rinaire en Afrique.
          </p>

          {/* Stats Bar */}
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.total || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>Total</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.emploi || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}><FontAwesome name="briefcase" /> Emplois</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.appel_offre || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}><FontAwesome name="gavel" /> Appels d'offres</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{(stats.marche || 0) + (stats.bourse || 0)}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}><FontAwesome name="graduation-cap" /> March\u00e9s & Bourses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section style={{ padding: '30px 0 50px' }}>
        <div className="container">
          {/* Tab Filter */}
          <div className="d-flex flex-wrap gap-2 mb-4" style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
            {TYPE_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTypeChange(tab.value)}
                className="btn btn-sm"
                style={
                  activeType === tab.value
                    ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', color: '#fff', border: 'none', borderRadius: '20px', padding: '6px 16px', fontWeight: '600', fontSize: '13px' }
                    : { background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }
                }
              >
                <FontAwesome name={tab.icon} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Country Filter */}
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text" style={{ background: '#f8f9fa', border: '1px solid #ddd' }}>
                  <FontAwesome name="search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher une opportunit\u00e9..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={countryFilter}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={{ border: '1px solid #ddd' }}
              >
                <option value="">Tous les pays</option>
                <option value="Senegal">S\u00e9n\u00e9gal</option>
                <option value="Cote d'Ivoire">C\u00f4te d'Ivoire</option>
                <option value="Mali">Mali</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Niger">Niger</option>
                <option value="Cameroun">Cameroun</option>
                <option value="Tchad">Tchad</option>
                <option value="Guinee">Guin\u00e9e</option>
                <option value="Togo">Togo</option>
                <option value="Benin">B\u00e9nin</option>
                <option value="RDC">RDC</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Maroc">Maroc</option>
                <option value="Tunisie">Tunisie</option>
                <option value="Algerie">Alg\u00e9rie</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              <strong>{pagination.total || opportunities.length}</strong> opportunit\u00e9(s) trouv\u00e9e(s)
              {activeType && <span> dans <strong>{TYPE_TABS.find(t => t.value === activeType)?.label}</strong></span>}
              {countryFilter && <span> en <strong>{countryFilter}</strong></span>}
            </p>
          )}

          {/* Content */}
          {loading ? (
            <LoadingSpinner text="Chargement des opportunit\u00e9s..." />
          ) : opportunities.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }}>
                <FontAwesome name="search" />
              </div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>Aucune opportunit\u00e9 trouv\u00e9e</h3>
              <p style={{ color: '#999' }}>
                Essayez de modifier vos crit\u00e8res de recherche ou de consulter une autre cat\u00e9gorie.
              </p>
              <button
                className="btn btn-outline-primary mt-3"
                onClick={() => setSearchParams({})}
              >
                <FontAwesome name="refresh" /> R\u00e9initialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {opportunities.map(opp => (
                  <div key={opp.id} className="col-md-6 col-lg-4">
                    <OpportunityCard opportunity={opp} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pages || 1}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default OpportunitiesPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vetAlertsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import Pagination from '../../component/shared/Pagination';
import AlertCard from '../../component/vet-alerts/AlertCard';

const TYPE_FILTERS = [
  { value: '', label: 'Tous les types', icon: 'list' },
  { value: 'maladie', label: 'Maladie', icon: 'bug' },
  { value: 'mortalite', label: 'Mortalit\u00e9', icon: 'heartbeat' },
  { value: 'intoxication', label: 'Intoxication', icon: 'flask' },
  { value: 'autre', label: 'Autre', icon: 'bell' },
];

const PRIORITY_FILTERS = [
  { value: '', label: 'Toutes les priorit\u00e9s' },
  { value: 'critical', label: 'Critique', color: '#d32f2f' },
  { value: 'high', label: '\u00c9lev\u00e9e', color: '#e65100' },
  { value: 'medium', label: 'Moyenne', color: '#f9a825' },
  { value: 'low', label: 'Faible', color: '#2e7d32' },
];

const VetAlertsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, by_type: {}, by_priority: {} });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const activeType = searchParams.get('type') || '';
  const activePriority = searchParams.get('priority') || '';
  const searchQuery = searchParams.get('search') || '';
  const countryFilter = searchParams.get('country') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      const res = await vetAlertsApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    };
    loadStats();
  }, []);

  // Load alerts
  useEffect(() => {
    loadAlerts();
  }, [activeType, activePriority, searchQuery, countryFilter, currentPage]);

  const loadAlerts = async () => {
    setLoading(true);
    const params = { page: currentPage, limit: 12 };
    if (activeType) params.type = activeType;
    if (activePriority) params.priority = activePriority;
    if (searchQuery) params.search = searchQuery;
    if (countryFilter) params.country = countryFilter;

    const res = await vetAlertsApi.getAll(params);
    if (res.success) {
      setAlerts(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    }
    setLoading(false);
  };

  const updateParams = useCallback((newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach(key => {
      if (!updated[key]) delete updated[key];
    });
    setSearchParams(updated);
  }, [searchParams, setSearchParams]);

  const handleTypeChange = (type) => {
    updateParams({ type, page: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriorityChange = (priority) => {
    updateParams({ priority, page: '' });
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

  const byType = stats.by_type || {};
  const byPriority = stats.by_priority || {};

  return (
    <div className="vet-alerts-page">
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #880e4f 100%)',
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
            <span>Alertes V\u00e9t\u00e9rinaires</span>
          </nav>

          <div className="d-flex flex-wrap justify-content-between align-items-start">
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>
                <FontAwesome name="bell" /> Alertes V\u00e9t\u00e9rinaires
              </h1>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '25px', maxWidth: '600px' }}>
                Consultez les alertes sanitaires v\u00e9t\u00e9rinaires en Afrique.
                Signalez les \u00e9pid\u00e9mies, mortalit\u00e9s ou intoxications pour prot\u00e9ger la sant\u00e9 animale.
              </p>
            </div>
            <Link
              to={isAuthenticated ? '/soumettre-alerte' : '/connexion'}
              state={!isAuthenticated ? { from: { pathname: '/soumettre-alerte' } } : undefined}
              className="btn btn-lg"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '10px',
                fontWeight: '600',
                padding: '10px 24px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <FontAwesome name="plus-circle" /> Soumettre une alerte
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats.total || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>Total alertes</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{byPriority.critical || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}><FontAwesome name="exclamation-circle" /> Critiques</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{byType.maladie || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}><FontAwesome name="bug" /> Maladies</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '15px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{(byType.mortalite || 0) + (byType.intoxication || 0)}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}><FontAwesome name="heartbeat" /> Mortalit\u00e9s & Intox.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section style={{ padding: '30px 0 50px' }}>
        <div className="container">
          {/* Type Filter Tabs */}
          <div className="d-flex flex-wrap gap-2 mb-3" style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
            {TYPE_FILTERS.map(filter => (
              <button
                key={filter.value}
                onClick={() => handleTypeChange(filter.value)}
                className="btn btn-sm"
                style={
                  activeType === filter.value
                    ? { background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '20px', padding: '6px 16px', fontWeight: '600', fontSize: '13px' }
                    : { background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '20px', padding: '6px 16px', fontSize: '13px' }
                }
              >
                <FontAwesome name={filter.icon} /> {filter.label}
                {filter.value && byType[filter.value] !== undefined && (
                  <span className="ms-1">({byType[filter.value]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Second filter row: priority, search, country */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <select
                className="form-select"
                value={activePriority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                style={{ border: '1px solid #ddd', borderRadius: '8px' }}
              >
                {PRIORITY_FILTERS.map(pf => (
                  <option key={pf.value} value={pf.value}>
                    {pf.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text" style={{ background: '#f8f9fa', border: '1px solid #ddd' }}>
                  <FontAwesome name="search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher une alerte..."
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
                style={{ border: '1px solid #ddd', borderRadius: '8px' }}
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
                <option value="Mauritanie">Mauritanie</option>
                <option value="Congo">Congo</option>
                <option value="Gabon">Gabon</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              <strong>{pagination.total || alerts.length}</strong> alerte(s) trouv\u00e9e(s)
              {activeType && <span> de type <strong>{TYPE_FILTERS.find(t => t.value === activeType)?.label}</strong></span>}
              {activePriority && <span>, priorit\u00e9 <strong>{PRIORITY_FILTERS.find(p => p.value === activePriority)?.label}</strong></span>}
              {countryFilter && <span> en <strong>{countryFilter}</strong></span>}
            </p>
          )}

          {/* Content */}
          {loading ? (
            <LoadingSpinner text="Chargement des alertes..." />
          ) : alerts.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }}>
                <FontAwesome name="bell-slash-o" />
              </div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>Aucune alerte trouv\u00e9e</h3>
              <p style={{ color: '#999' }}>
                Aucune alerte ne correspond \u00e0 vos crit\u00e8res de recherche.
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
                {alerts.map(alert => (
                  <div key={alert.id} className="col-md-6 col-lg-4">
                    <AlertCard alert={alert} />
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

export default VetAlertsPage;

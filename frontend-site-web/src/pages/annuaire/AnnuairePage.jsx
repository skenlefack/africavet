import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import Pagination from '../../component/shared/Pagination';
import DirectoryCard from '../../component/annuaire/DirectoryCard';
import DirectoryFilters from '../../component/annuaire/DirectoryFilters';
import DocumentCard from '../../component/documents/DocumentCard';
import { annuaireApi, documentsApi } from '../../services/api';

const TABS = [
  { key: 'all', label: 'Tout', icon: 'th-large' },
  { key: 'experts', label: 'Experts', icon: 'user-md' },
  { key: 'organisations', label: 'Organisations', icon: 'building' },
  { key: 'produits', label: 'Materiels / Produits', icon: 'cube' },
  { key: 'documents', label: 'Documents', icon: 'file-text-o' },
];

const ITEMS_PER_PAGE = 12;

const AnnuairePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    speciality: searchParams.get('speciality') || '',
    country: searchParams.get('country') || '',
    organization_type: searchParams.get('organization_type') || '',
  });
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (searchQuery) params.search = searchQuery;
      if (filters.speciality) params.speciality = filters.speciality;
      if (filters.country) params.country = filters.country;
      if (filters.organization_type) params.organization_type = filters.organization_type;

      let response;

      switch (activeTab) {
        case 'experts':
          response = await annuaireApi.getExperts(params);
          break;
        case 'organisations':
          response = await annuaireApi.getOrganizations(params);
          break;
        case 'produits':
          params.type = 'produit';
          response = await annuaireApi.getAll(params);
          break;
        case 'documents':
          response = await documentsApi.getAll({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            ...(searchQuery ? { query: searchQuery } : {}),
            ...(filters.country ? { country: filters.country } : {}),
          });
          break;
        default:
          response = await annuaireApi.getAll(params);
      }

      if (response.success) {
        if (activeTab === 'documents') {
          setItems(response.data || []);
          setTotalItems(response.pagination?.total || response.data?.length || 0);
        } else {
          setItems(response.data?.items || response.data || []);
          setTotalItems(response.data?.total || response.data?.length || 0);
        }
      } else {
        setError(response.message || 'Erreur lors du chargement des donnees.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchQuery, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('tab', activeTab);
    if (searchQuery) params.set('q', searchQuery);
    if (currentPage > 1) params.set('page', currentPage);
    if (filters.speciality) params.set('speciality', filters.speciality);
    if (filters.country) params.set('country', filters.country);
    if (filters.organization_type) params.set('organization_type', filters.organization_type);
    setSearchParams(params, { replace: true });
  }, [activeTab, searchQuery, currentPage, filters, setSearchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    if (!value) {
      setCurrentPage(1);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ speciality: '', country: '', organization_type: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          padding: '60px 0 50px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '10%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1
                style={{
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '36px',
                  marginBottom: '12px',
                }}
              >
                <FontAwesome name="address-book" style={{ marginRight: '12px' }} />
                Annuaire AfricaVET
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', marginBottom: '30px' }}>
                Trouvez des experts veterinaires, des organisations et des fournisseurs
                de materiels et produits a travers l'Afrique.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="d-flex justify-content-center">
                <div
                  className="d-flex w-100"
                  style={{
                    maxWidth: '600px',
                    background: '#fff',
                    borderRadius: '50px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    placeholder="Rechercher par nom, specialite, pays..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '14px 24px',
                      fontSize: '15px',
                      color: '#333',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '14px 28px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                    }}
                  >
                    <FontAwesome name="search" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e9ecef' }}>
        <div className="container">
          <div className="d-flex flex-wrap justify-content-center" style={{ gap: '4px', padding: '12px 0' }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className="btn btn-sm"
                style={{
                  background: activeTab === tab.key ? 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#555',
                  border: activeTab === tab.key ? 'none' : '1px solid #e0e0e0',
                  borderRadius: '25px',
                  padding: '8px 20px',
                  fontWeight: activeTab === tab.key ? '700' : '500',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                <FontAwesome name={tab.icon} style={{ marginRight: '6px' }} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ padding: '30px 15px 60px' }}>
        <div className="row">
          {/* Mobile filter toggle */}
          <div className="col-12 d-lg-none mb-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="btn btn-outline-secondary btn-sm w-100"
              style={{ borderRadius: '8px' }}
            >
              <FontAwesome name="filter" style={{ marginRight: '6px' }} />
              {showMobileFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </button>
          </div>

          {/* Sidebar filters */}
          <div className={`col-lg-3 ${showMobileFilters ? '' : 'd-none d-lg-block'}`}>
            <DirectoryFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              activeTab={activeTab}
            />

            {/* Register CTA */}
            <div
              className="card border-0 shadow-sm text-center"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #354e84 0%, #7ac142 100%)',
                  padding: '30px 20px',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px',
                  }}
                >
                  <FontAwesome name="plus-circle" style={{ color: '#fff', fontSize: '28px' }} />
                </div>
                <h6 style={{ color: '#fff', fontWeight: '700', marginBottom: '8px', fontSize: '15px' }}>
                  Rejoignez l'annuaire
                </h6>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginBottom: '20px' }}>
                  Augmentez votre visibilite aupres de la communaute veterinaire africaine.
                </p>
                <Link
                  to="/annuaire/inscription"
                  className="btn btn-light btn-sm"
                  style={{ borderRadius: '25px', padding: '8px 24px', fontWeight: '700', fontSize: '13px' }}
                >
                  <FontAwesome name="user-plus" style={{ marginRight: '6px' }} />
                  S'inscrire dans l'annuaire
                </Link>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-lg-9">
            {/* Results count */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                {loading ? (
                  'Recherche en cours...'
                ) : (
                  <>
                    <strong>{totalItems}</strong> resultat{totalItems !== 1 ? 's' : ''} trouve{totalItems !== 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>

            {/* Loading */}
            {loading && <LoadingSpinner text="Chargement de l'annuaire..." />}

            {/* Error */}
            {error && !loading && (
              <div className="text-center" style={{ padding: '60px 20px' }}>
                <FontAwesome name="exclamation-triangle" style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '16px', display: 'block' }} />
                <h5 style={{ color: '#333', marginBottom: '8px' }}>Erreur</h5>
                <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
                <button onClick={fetchData} className="btn btn-primary btn-sm" style={{ borderRadius: '8px' }}>
                  <FontAwesome name="refresh" style={{ marginRight: '6px' }} />
                  Reessayer
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && items.length === 0 && (
              <div className="text-center" style={{ padding: '60px 20px' }}>
                <FontAwesome
                  name="search"
                  style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px', display: 'block' }}
                />
                <h5 style={{ color: '#333', marginBottom: '8px' }}>Aucun resultat</h5>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Aucun element ne correspond a vos criteres de recherche.
                  <br />
                  Essayez de modifier vos filtres ou votre recherche.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn btn-outline-primary btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  <FontAwesome name="times" style={{ marginRight: '6px' }} />
                  Effacer les filtres
                </button>
              </div>
            )}

            {/* Grid of cards */}
            {!loading && !error && items.length > 0 && (
              <>
                <div className="row">
                  {items.map((item) => (
                    activeTab === 'documents' ? (
                      <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                        <DocumentCard document={item} layout="grid" />
                      </div>
                    ) : (
                      <DirectoryCard key={item.id} item={item} />
                    )
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnuairePage;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import Pagination from '../../component/shared/Pagination';
import DocumentCard from '../../component/documents/DocumentCard';
import DocumentFilters from '../../component/documents/DocumentFilters';
import { documentsApi } from '../../services/api';
import './documents.scss';

const DocumentsSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('');

  const searchQuery = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const countryFilter = searchParams.get('country') || '';
  const yearFilter = searchParams.get('year') || '';
  const sortFilter = searchParams.get('sort') || 'recent';
  const catFilter = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    documentsApi.getCategoriesTree().then(res => {
      if (res.success) setCategories((res.data || []).filter(c => c.is_active));
    });
  }, []);

  useEffect(() => {
    setSelectedCategory(catFilter);
    loadDocuments();
  }, [searchQuery, typeFilter, countryFilter, yearFilter, sortFilter, catFilter, currentPage]);

  const loadDocuments = async () => {
    setLoading(true);
    const params = { page: currentPage, limit: 12 };
    if (searchQuery) params.query = searchQuery;
    if (typeFilter) params.type = typeFilter;
    if (countryFilter) params.country = countryFilter;
    if (yearFilter) params.year = yearFilter;
    if (catFilter) params.category = catFilter;

    // Map sort values to API params
    if (sortFilter === 'popular') {
      params.sort = 'download_count';
      params.order = 'DESC';
    } else if (sortFilter === 'title') {
      params.sort = 'title_fr';
      params.order = 'ASC';
    } else if (sortFilter === 'oldest') {
      params.sort = 'created_at';
      params.order = 'ASC';
    }
    // 'recent' is the default

    const res = await documentsApi.getAll(params);
    if (res.success) {
      setDocuments(res.data || []);
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

  const handleFilterChange = (filters) => {
    updateParams({
      q: filters.search || '',
      type: filters.type || '',
      country: filters.country || '',
      year: filters.year || '',
      sort: filters.sort || '',
      page: '',
    });
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    updateParams({ category: slug, page: '' });
  };

  const handlePageChange = (page) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Only parent categories for sidebar
  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <div className="documents-page">
      {/* Header */}
      <section className="doc-hero">
        <div className="container">
          <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              <FontAwesome name="home" /> Accueil
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <Link to="/bibliotheque" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
              Bibliotheque
            </Link>
            <span style={{ margin: '0 8px', opacity: 0.6 }}><FontAwesome name="angle-right" /></span>
            <span>Recherche</span>
          </nav>

          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '10px' }}>
            <FontAwesome name="search" />{' '}
            {searchQuery ? `Resultats pour "${searchQuery}"` : 'Recherche de documents'}
          </h1>
          {pagination.total > 0 && (
            <p style={{ opacity: 0.9, marginBottom: '0' }}>
              {pagination.total} document{pagination.total > 1 ? 's' : ''} trouve{pagination.total > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '30px 0 50px' }}>
        <div className="container">
          <div className="row">
            {/* Sidebar: Categories + Filters */}
            <div className="col-lg-3 mb-4">
              {/* Categories */}
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #eee',
                padding: '20px',
                marginBottom: '20px',
              }}>
                <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                  <FontAwesome name="folder-open-o" /> Categories
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    className={`btn btn-sm text-left ${!selectedCategory ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => handleCategoryChange('')}
                    style={{ borderRadius: '6px', textAlign: 'left' }}
                  >
                    Toutes les categories
                  </button>
                  {parentCategories.map(cat => (
                    <button
                      key={cat.id}
                      className={`btn btn-sm text-left ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => handleCategoryChange(cat.slug)}
                      style={{ borderRadius: '6px', textAlign: 'left' }}
                    >
                      {cat.icon && <FontAwesome name={cat.icon} />} {cat.name_fr}
                      {cat.document_count > 0 && (
                        <span className="badge badge-secondary ml-1" style={{ float: 'right' }}>
                          {cat.document_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced filters */}
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #eee',
                padding: '20px',
              }}>
                <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                  <FontAwesome name="sliders" /> Filtres
                </h5>
                <DocumentFilters
                  onFilterChange={handleFilterChange}
                  initialSearch={searchQuery}
                  initialType={typeFilter}
                  initialCountry={countryFilter}
                  initialYear={yearFilter}
                  initialSort={sortFilter}
                  showSearch
                />
              </div>
            </div>

            {/* Main content */}
            <div className="col-lg-9">
              {/* Toolbar */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div style={{ fontSize: '14px', color: '#777' }}>
                  {!loading && (
                    pagination.total > 0
                      ? `Affichage de ${(pagination.page - 1) * 12 + 1}-${Math.min(pagination.page * 12, pagination.total)} sur ${pagination.total}`
                      : 'Aucun resultat'
                  )}
                </div>
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <FontAwesome name="th" />
                  </button>
                  <button
                    className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <FontAwesome name="list" />
                  </button>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <LoadingSpinner />
              ) : documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ fontSize: '48px', color: '#ddd', marginBottom: '15px' }}>
                    <FontAwesome name="search" />
                  </div>
                  <h4 style={{ color: '#666' }}>Aucun document trouve</h4>
                  <p style={{ color: '#999', maxWidth: '400px', margin: '0 auto 20px' }}>
                    Essayez de modifier vos criteres de recherche ou parcourez nos categories.
                  </p>
                  <Link to="/bibliotheque" className="btn btn-primary">
                    <FontAwesome name="arrow-left" /> Retour a la bibliotheque
                  </Link>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="row">
                  {documents.map(doc => (
                    <div key={doc.id} className="col-lg-4 col-md-6 mb-3">
                      <DocumentCard document={doc} layout="grid" />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {documents.map(doc => (
                    <DocumentCard key={doc.id} document={doc} layout="list" />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ marginTop: '30px' }}>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentsSearchPage;

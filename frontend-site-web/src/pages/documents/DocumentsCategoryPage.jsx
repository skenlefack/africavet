import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import Pagination from '../../component/shared/Pagination';
import DocumentCard from '../../component/documents/DocumentCard';
import DocumentFilters from '../../component/documents/DocumentFilters';
import { documentsApi } from '../../services/api';
import './documents.scss';

const DocumentsCategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [viewMode, setViewMode] = useState('grid');

  const currentPage = parseInt(searchParams.get('page') || '1');
  const typeFilter = searchParams.get('type') || '';
  const sortFilter = searchParams.get('sort') || 'recent';

  useEffect(() => {
    loadCategory();
  }, [slug, currentPage, typeFilter, sortFilter]);

  const loadCategory = async () => {
    setLoading(true);
    const params = { page: currentPage, limit: 12 };
    if (typeFilter) params.type = typeFilter;
    if (sortFilter) params.sort = sortFilter;

    const res = await documentsApi.getByCategory(slug, params);
    if (res.success) {
      setCategory(res.data?.category || null);
      setDocuments(res.data?.documents || []);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
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
      type: filters.type || '',
      sort: filters.sort || '',
      page: '',
    });
  };

  const handlePageChange = (page) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !category) return <LoadingSpinner fullPage />;

  const categoryColor = category?.color || '#354e84';

  return (
    <div className="documents-page">
      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}cc 100%)`,
          padding: '40px 0 30px',
          color: '#fff',
        }}
      >
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
            <span>{category?.name_fr || slug}</span>
          </nav>

          <div className="d-flex align-items-center" style={{ gap: '16px' }}>
            {category?.icon && (
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                <FontAwesome name={category.icon} />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>
                {category?.name_fr || 'Categorie'}
              </h1>
              {category?.description_fr && (
                <p style={{ opacity: 0.9, marginBottom: '0', maxWidth: '600px' }}>
                  {category.description_fr}
                </p>
              )}
            </div>
          </div>

          {pagination.total > 0 && (
            <div style={{ marginTop: '15px', opacity: 0.8, fontSize: '14px' }}>
              {pagination.total} document{pagination.total > 1 ? 's' : ''} dans cette categorie
            </div>
          )}
        </div>
      </section>

      {/* Subcategories if any */}
      {category?.children && category.children.length > 0 && (
        <section style={{ padding: '20px 0', background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
          <div className="container">
            <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
              {category.children.filter(c => c.is_active).map(sub => (
                <Link
                  key={sub.id}
                  to={`/bibliotheque/categorie/${sub.slug}`}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ borderRadius: '20px' }}
                >
                  {sub.icon && <FontAwesome name={sub.icon} />} {sub.name_fr}
                  {sub.document_count > 0 && (
                    <span className="badge badge-light ml-1">{sub.document_count}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section style={{ padding: '30px 0 40px' }}>
        <div className="container">
          {/* Filters + View toggle */}
          <div className="d-flex justify-content-between align-items-start flex-wrap mb-3" style={{ gap: '10px' }}>
            <DocumentFilters
              compact
              initialType={typeFilter}
              initialSort={sortFilter}
              onFilterChange={handleFilterChange}
              showSearch={false}
            />
            <div className="btn-group" style={{ flexShrink: 0 }}>
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

          {/* Documents */}
          {loading ? (
            <LoadingSpinner />
          ) : documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FontAwesome name="folder-open-o" />
              <h4 style={{ marginTop: '15px', color: '#666' }}>Aucun document trouve</h4>
              <p style={{ color: '#999' }}>
                Cette categorie ne contient pas encore de documents.
              </p>
              <Link to="/bibliotheque" className="btn btn-primary">
                <FontAwesome name="arrow-left" /> Retour a la bibliotheque
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="row">
              {documents.map(doc => (
                <div key={doc.id} className="col-lg-3 col-md-4 col-sm-6 mb-3">
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
      </section>
    </div>
  );
};

export default DocumentsCategoryPage;

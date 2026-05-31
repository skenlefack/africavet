import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import DocumentTypeIcon from '../../component/documents/DocumentTypeIcon';
import DocumentDownloadButton from '../../component/documents/DocumentDownloadButton';
import DocumentCard from '../../component/documents/DocumentCard';
import { documentsApi, getImageUrl } from '../../services/api';
import './documents.scss';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    loadDocument();
    window.scrollTo({ top: 0 });
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    const res = await documentsApi.getById(id);
    if (res.success && res.data) {
      setDocument(res.data);
      setRelated(res.data.related_documents || []);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' Ko';
    return bytes + ' o';
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (!document) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }}>
          <FontAwesome name="file-o" />
        </div>
        <h3 style={{ color: '#666' }}>Document introuvable</h3>
        <p style={{ color: '#999' }}>Ce document n'existe pas ou a ete supprime.</p>
        <Link to="/bibliotheque" className="btn btn-primary">
          <FontAwesome name="arrow-left" /> Retour a la bibliotheque
        </Link>
      </div>
    );
  }

  const title = document.title_fr || document.title_en || 'Document';
  const description = document.description_fr || document.description_en || '';
  const isPDF = document.file_type?.toLowerCase() === 'pdf';
  const fileUrl = document.file_path ? getImageUrl(document.file_path) : null;
  const thumbnailUrl = document.thumbnail ? getImageUrl(document.thumbnail) : null;
  const tags = document.tags ? (typeof document.tags === 'string' ? document.tags.split(',').map(t => t.trim()) : document.tags) : [];

  return (
    <div className="document-detail-page">
      {/* Breadcrumb */}
      <section style={{ background: '#f8f9fa', padding: '15px 0', borderBottom: '1px solid #eee' }}>
        <div className="container">
          <nav style={{ fontSize: '14px' }}>
            <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>
              <FontAwesome name="home" /> Accueil
            </Link>
            <span style={{ margin: '0 8px', color: '#ccc' }}><FontAwesome name="angle-right" /></span>
            <Link to="/bibliotheque" style={{ color: '#666', textDecoration: 'none' }}>
              Bibliotheque
            </Link>
            {document.category_name_fr && (
              <>
                <span style={{ margin: '0 8px', color: '#ccc' }}><FontAwesome name="angle-right" /></span>
                <Link
                  to={`/bibliotheque/categorie/${document.category_slug}`}
                  style={{ color: '#666', textDecoration: 'none' }}
                >
                  {document.category_name_fr}
                </Link>
              </>
            )}
            <span style={{ margin: '0 8px', color: '#ccc' }}><FontAwesome name="angle-right" /></span>
            <span style={{ color: '#333' }}>{title.substring(0, 40)}{title.length > 40 ? '...' : ''}</span>
          </nav>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '30px 0 50px' }}>
        <div className="container">
          <div className="row">
            {/* Main Column */}
            <div className="col-lg-8 mb-4">
              {/* Title & meta */}
              <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
                {title}
              </h1>
              <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: '12px', fontSize: '14px', color: '#777' }}>
                <span><FontAwesome name="calendar-o" /> {formatDate(document.created_at)}</span>
                <span><FontAwesome name="download" /> {document.download_count || 0} telechargements</span>
                {document.author && <span><FontAwesome name="user" /> {document.author}</span>}
                {document.country && <span><FontAwesome name="globe" /> {document.country}</span>}
              </div>

              {/* Category badge */}
              {document.category_name_fr && (
                <Link
                  to={`/bibliotheque/categorie/${document.category_slug}`}
                  style={{
                    display: 'inline-block',
                    background: document.category_color || '#354e84',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    textDecoration: 'none',
                    marginBottom: '20px',
                  }}
                >
                  {document.category_name_fr}
                </Link>
              )}

              {/* PDF Preview or Thumbnail */}
              {isPDF && fileUrl ? (
                <div className="pdf-preview mb-4">
                  <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=0`}
                    title={title}
                  />
                </div>
              ) : thumbnailUrl ? (
                <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  border: '1px solid #eee',
                }}>
                  <DocumentTypeIcon type={document.file_type} size="xl" />
                  <p style={{ marginTop: '15px', color: '#999', fontSize: '14px' }}>
                    Apercu non disponible pour ce type de fichier
                  </p>
                </div>
              )}

              {/* Description */}
              {description && (
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Description</h4>
                  <div
                    style={{ color: '#555', lineHeight: '1.7', fontSize: '15px' }}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                    <FontAwesome name="tags" /> Mots-cles
                  </h5>
                  <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                    {tags.map((tag, i) => (
                      <Link
                        key={i}
                        to={`/bibliotheque/recherche?q=${encodeURIComponent(tag)}`}
                        className="badge"
                        style={{
                          background: '#f0f0f0',
                          color: '#555',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          textDecoration: 'none',
                          fontWeight: '400',
                        }}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Download CTA */}
              <div style={{
                background: 'linear-gradient(135deg, #7ac14210, #354e8410)',
                borderRadius: '12px',
                padding: '25px',
                textAlign: 'center',
                border: '1px solid #eee',
              }}>
                <h5 style={{ fontWeight: '600', marginBottom: '5px' }}>Telecharger ce document</h5>
                <p style={{ color: '#777', fontSize: '14px', marginBottom: '15px' }}>
                  <DocumentTypeIcon type={document.file_type} size="sm" showLabel />
                  {document.file_size > 0 && ` - ${formatFileSize(document.file_size)}`}
                </p>
                <DocumentDownloadButton document={document} size="lg" />
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* File info card */}
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #eee',
                padding: '20px',
                marginBottom: '20px',
              }}>
                <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                  <FontAwesome name="info-circle" /> Informations
                </h5>
                <table className="meta-table" style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td>Type</td>
                      <td><DocumentTypeIcon type={document.file_type} size="sm" showLabel /></td>
                    </tr>
                    {document.file_size > 0 && (
                      <tr>
                        <td>Taille</td>
                        <td>{formatFileSize(document.file_size)}</td>
                      </tr>
                    )}
                    {document.language && (
                      <tr>
                        <td>Langue</td>
                        <td>{document.language === 'fr' ? 'Francais' : document.language === 'en' ? 'Anglais' : document.language}</td>
                      </tr>
                    )}
                    {document.publication_year && (
                      <tr>
                        <td>Annee</td>
                        <td>{document.publication_year}</td>
                      </tr>
                    )}
                    {document.country && (
                      <tr>
                        <td>Pays</td>
                        <td>{document.country}</td>
                      </tr>
                    )}
                    {document.author && (
                      <tr>
                        <td>Auteur</td>
                        <td>{document.author}</td>
                      </tr>
                    )}
                    {document.source_url && (
                      <tr>
                        <td>Source</td>
                        <td>
                          <a href={document.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px' }}>
                            <FontAwesome name="external-link" /> Voir la source
                          </a>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>Publie le</td>
                      <td>{formatDate(document.created_at)}</td>
                    </tr>
                    <tr>
                      <td style={{ borderBottom: 'none' }}>Telechargements</td>
                      <td style={{ borderBottom: 'none', fontWeight: '600' }}>{document.download_count || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Download button */}
              <div style={{ marginBottom: '20px' }}>
                <DocumentDownloadButton document={document} size="md" className="btn-block" />
              </div>

              {/* Share */}
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #eee',
                padding: '20px',
                marginBottom: '20px',
              }}>
                <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                  <FontAwesome name="share-alt" /> Partager
                </h5>
                <div className="d-flex" style={{ gap: '10px' }}>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                    style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FontAwesome name="facebook" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-info"
                    style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FontAwesome name="twitter" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary"
                    style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FontAwesome name="linkedin" />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-success"
                    style={{ borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FontAwesome name="whatsapp" />
                  </a>
                </div>
              </div>

              {/* Related documents */}
              {related.length > 0 && (
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #eee',
                  padding: '20px',
                }}>
                  <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                    <FontAwesome name="file-o" /> Documents similaires
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {related.slice(0, 5).map(doc => (
                      <Link
                        key={doc.id}
                        to={`/bibliotheque/document/${doc.id}`}
                        className="related-doc-item"
                        style={{ textDecoration: 'none', color: '#333' }}
                      >
                        <DocumentTypeIcon type={doc.file_type} size="md" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.3' }}>
                            {(doc.title_fr || doc.title_en || '').substring(0, 50)}
                            {(doc.title_fr || '').length > 50 ? '...' : ''}
                          </div>
                          <small style={{ color: '#999' }}>
                            <FontAwesome name="download" /> {doc.download_count || 0}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentDetailPage;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const CertificatesList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [activeTab, setActiveTab] = useState('certificates');
    const [certificates, setCertificates] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        const [certsRes, templatesRes] = await Promise.all([
            api.get('/elearning/certificates/all', token),
            api.get('/elearning/certificate-templates', token)
        ]);
        if (certsRes.success) setCertificates(certsRes.data || []);
        if (templatesRes.success) setTemplates(templatesRes.data || []);
        setLoading(false);
    };

    const handleRevoke = async (id) => {
        if (window.confirm('Révoquer ce certificat ?')) {
            const res = await api.put(`/elearning/certificates/${id}/revoke`, {}, token);
            if (res.success) {
                setToast({ message: 'Certificat révoqué', type: 'success' });
                fetchData();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const handleReinstate = async (id) => {
        const res = await api.put(`/elearning/certificates/${id}/reinstate`, {}, token);
        if (res.success) {
            setToast({ message: 'Certificat rétabli', type: 'success' });
            fetchData();
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (window.confirm('Supprimer ce template ?')) {
            const res = await api.delete(`/elearning/certificate-templates/${id}`, token);
            if (res.success) {
                setToast({ message: 'Template supprimé', type: 'success' });
                setTemplates(prev => prev.filter(t => t.id !== id));
            }
        }
    };

    const handleSetDefault = async (id) => {
        const res = await api.put(`/elearning/certificate-templates/${id}`, { is_default: true }, token);
        if (res.success) {
            setToast({ message: 'Template par défaut mis à jour', type: 'success' });
            fetchData();
        }
    };

    // Filter certificates
    const filteredCerts = certificates.filter(c => {
        const name = (c.user_name || c.user_email || '').toLowerCase();
        const course = (c.course_title || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || course.includes(searchQuery.toLowerCase());
    });

    const totalItems = filteredCerts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredCerts.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Certificats</h2>
                    <p className="text-muted mb-0">{certificates.length} certificats, {templates.length} templates</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/elearning" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <Link to="/elearning/certificate-templates/new" className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                        <i className="fas fa-plus me-2"></i> Nouveau template
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'certificates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('certificates')}>
                        <i className="fas fa-certificate me-2"></i> Certificats émis ({certificates.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('templates')}>
                        <i className="fas fa-file-alt me-2"></i> Templates ({templates.length})
                    </button>
                </li>
            </ul>

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
                <>
                    <div className="card mb-4">
                        <div className="card-body py-3">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input type="text" className="form-control border-start-0" placeholder="Rechercher par étudiant ou cours..."
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Étudiant</th>
                                            <th>Cours</th>
                                            <th>Score</th>
                                            <th>Date</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map(cert => (
                                            <tr key={cert.id}>
                                                <td>
                                                    <strong className="small">{cert.user_name || 'N/A'}</strong>
                                                    <small className="text-muted d-block">{cert.user_email || ''}</small>
                                                </td>
                                                <td className="small">{cert.course_title || '-'}</td>
                                                <td><span className="badge bg-light text-dark">{cert.score || 0}%</span></td>
                                                <td><small>{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('fr-FR') : '-'}</small></td>
                                                <td>
                                                    <span className={`badge ${cert.status === 'revoked' ? 'bg-danger' : 'bg-success'}`}>
                                                        {cert.status === 'revoked' ? 'Révoqué' : 'Valide'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {cert.status === 'revoked' ? (
                                                        <button className="btn btn-sm btn-outline-success" onClick={() => handleReinstate(cert.id)}>
                                                            <i className="fas fa-undo me-1"></i> Rétablir
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRevoke(cert.id)}>
                                                            <i className="fas fa-ban me-1"></i> Révoquer
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {paginated.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-muted">
                                                    <i className="fas fa-certificate fa-3x mb-3 opacity-50"></i>
                                                    <p className="mb-0">Aucun certificat trouvé</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {totalItems > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                                itemName="certificats"
                            />
                        )}
                    </div>
                </>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="row g-4">
                    {templates.map(tmpl => (
                        <div key={tmpl.id} className="col-md-4">
                            <div className={`card h-100 ${tmpl.is_default ? 'border-success' : ''}`}>
                                {tmpl.background_image ? (
                                    <img src={tmpl.background_image} alt={tmpl.name} className="card-img-top" style={{ height: '160px', objectFit: 'cover' }} />
                                ) : (
                                    <div className="card-img-top d-flex align-items-center justify-content-center"
                                        style={{ height: '160px', background: 'linear-gradient(135deg, #F39C12 0%, #E74C3C 100%)' }}>
                                        <i className="fas fa-certificate fa-3x text-white opacity-75"></i>
                                    </div>
                                )}
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="mb-0">{tmpl.name || 'Template'}</h6>
                                        {tmpl.is_default && <span className="badge bg-success">Par défaut</span>}
                                    </div>
                                    <p className="small text-muted mb-0">{tmpl.description || 'Aucune description'}</p>
                                </div>
                                <div className="card-footer bg-transparent">
                                    <div className="btn-group w-100 btn-group-sm">
                                        <button className="btn btn-outline-primary" onClick={() => navigate(`/elearning/certificate-templates/${tmpl.id}`)}>
                                            <i className="fas fa-edit me-1"></i> Modifier
                                        </button>
                                        {!tmpl.is_default && (
                                            <button className="btn btn-outline-success" onClick={() => handleSetDefault(tmpl.id)}>
                                                <i className="fas fa-star"></i>
                                            </button>
                                        )}
                                        <button className="btn btn-outline-danger" onClick={() => handleDeleteTemplate(tmpl.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center py-5 text-muted">
                                    <i className="fas fa-file-alt fa-3x mb-3 opacity-50"></i>
                                    <p className="mb-2">Aucun template</p>
                                    <Link to="/elearning/certificate-templates/new" className="btn btn-primary">
                                        Créer un template
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default CertificatesList;

import React from 'react';
import { Link } from 'react-router-dom';

const OrganizationCard = ({ organization, compact = false }) => {
    const org = organization;

    // Configuration des badges de statut
    const statusConfig = {
        declared: {
            label: 'Déclaré',
            color: '#95a5a6',
            bgColor: '#95a5a610',
            icon: 'fa-file-alt'
        },
        verified: {
            label: 'Vérifié',
            color: '#27ae60',
            bgColor: '#27ae6015',
            icon: 'fa-check-circle'
        },
        accredited: {
            label: 'Accrédité',
            color: '#f39c12',
            bgColor: '#f39c1215',
            icon: 'fa-award'
        }
    };

    const status = statusConfig[org.verification_status] || statusConfig.declared;

    // Configuration des types
    const typeConfig = {
        veterinarian: { label: 'Vétérinaire', icon: 'fa-user-md' },
        clinic: { label: 'Clinique', icon: 'fa-clinic-medical' },
        hospital: { label: 'Hôpital', icon: 'fa-hospital' },
        laboratory: { label: 'Laboratoire', icon: 'fa-flask' },
        pharmacy: { label: 'Pharmacie', icon: 'fa-pills' },
        distributor: { label: 'Distributeur', icon: 'fa-truck' },
        school: { label: 'École', icon: 'fa-graduation-cap' },
        institution: { label: 'Institution', icon: 'fa-landmark' },
        ngo: { label: 'ONG', icon: 'fa-hands-helping' }
    };

    const typeInfo = typeConfig[org.actor_type] || { label: org.type || 'Organisation', icon: 'fa-building' };

    // Formater le numéro WhatsApp
    const formatWhatsApp = (phone) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        return `https://wa.me/${cleaned}`;
    };

    // Formater l'URL Google Maps
    const getDirectionsUrl = () => {
        if (org.latitude && org.longitude) {
            return `https://www.google.com/maps/dir/?api=1&destination=${org.latitude},${org.longitude}`;
        }
        if (org.address || org.city) {
            const query = encodeURIComponent(`${org.address || ''} ${org.city || ''} ${org.country || ''}`);
            return `https://www.google.com/maps/search/?api=1&query=${query}`;
        }
        return null;
    };

    if (compact) {
        // Version compacte pour les listes
        return (
            <Link
                to={`/annuaire/view/${org.id}`}
                className="card h-100 border-0 shadow-sm"
                style={{ textDecoration: 'none', transition: 'all 0.2s' }}
            >
                <div className="card-body p-3">
                    <div className="d-flex align-items-start">
                        <div
                            className="me-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: status.bgColor,
                                color: status.color
                            }}
                        >
                            <i className={`fas ${typeInfo.icon}`} style={{ fontSize: '20px' }}></i>
                        </div>
                        <div className="flex-grow-1 min-width-0">
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h6 className="mb-0 text-truncate text-dark">{org.name}</h6>
                                <span
                                    className="badge d-inline-flex align-items-center gap-1 flex-shrink-0"
                                    style={{ background: status.color, fontSize: '10px' }}
                                >
                                    <i className={`fas ${status.icon}`}></i>
                                    {status.label}
                                </span>
                            </div>
                            <small className="text-muted d-block">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                {org.city}{org.country ? `, ${org.country}` : ''}
                            </small>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Version complète (card premium)
    return (
        <div className="card h-100 border-0 shadow-sm" style={{ overflow: 'hidden' }}>
            {/* Header avec badge */}
            <div
                className="card-header border-0 py-3"
                style={{ background: status.bgColor }}
            >
                <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                        <div
                            className="me-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'white',
                                color: status.color,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            <i className={`fas ${typeInfo.icon}`} style={{ fontSize: '22px' }}></i>
                        </div>
                        <div>
                            <span className="text-muted small">{typeInfo.label}</span>
                            <h5 className="mb-0" style={{ fontWeight: '700', color: '#2c3e50' }}>
                                {org.name}
                            </h5>
                        </div>
                    </div>
                    <span
                        className="badge d-inline-flex align-items-center gap-1"
                        style={{ background: status.color, padding: '6px 10px' }}
                    >
                        <i className={`fas ${status.icon}`}></i>
                        {status.label}
                    </span>
                </div>
            </div>

            <div className="card-body">
                {/* Localisation */}
                <div className="mb-3">
                    <div className="d-flex align-items-start text-muted">
                        <i className="fas fa-map-marker-alt me-2 mt-1" style={{ color: '#e74c3c' }}></i>
                        <div>
                            {org.address && <span className="d-block">{org.address}</span>}
                            <span>{org.city}{org.country ? `, ${org.country}` : ''}</span>
                            {org.coverage_area && (
                                <small className="d-block text-muted">
                                    <i className="fas fa-expand-arrows-alt me-1"></i>
                                    Intervient aussi : {org.coverage_area}
                                </small>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contacts */}
                <div className="mb-3">
                    <div className="row g-2">
                        {org.phone && (
                            <div className="col-6">
                                <a
                                    href={`tel:${org.phone}`}
                                    className="d-flex align-items-center text-decoration-none p-2 rounded"
                                    style={{ background: '#f8f9fa' }}
                                >
                                    <i className="fas fa-phone me-2 text-primary"></i>
                                    <small className="text-dark text-truncate">{org.phone}</small>
                                </a>
                            </div>
                        )}
                        {org.whatsapp && (
                            <div className="col-6">
                                <a
                                    href={formatWhatsApp(org.whatsapp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-flex align-items-center text-decoration-none p-2 rounded"
                                    style={{ background: '#25D36610' }}
                                >
                                    <i className="fab fa-whatsapp me-2" style={{ color: '#25D366' }}></i>
                                    <small className="text-dark">WhatsApp</small>
                                </a>
                            </div>
                        )}
                        {org.email && (
                            <div className="col-12">
                                <a
                                    href={`mailto:${org.email}`}
                                    className="d-flex align-items-center text-decoration-none p-2 rounded"
                                    style={{ background: '#f8f9fa' }}
                                >
                                    <i className="fas fa-envelope me-2 text-muted"></i>
                                    <small className="text-dark text-truncate">{org.email}</small>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Services */}
                {org.services && org.services.length > 0 && (
                    <div className="mb-3">
                        <small className="text-muted d-block mb-2">
                            <i className="fas fa-cogs me-1"></i> Services
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                            {org.services.slice(0, 5).map((service, idx) => (
                                <span
                                    key={idx}
                                    className="badge"
                                    style={{ background: '#354e8415', color: '#354e84' }}
                                >
                                    {service}
                                </span>
                            ))}
                            {org.services.length > 5 && (
                                <span className="badge bg-secondary">+{org.services.length - 5}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Espèces */}
                {org.species && org.species.length > 0 && (
                    <div className="mb-3">
                        <small className="text-muted d-block mb-2">
                            <i className="fas fa-paw me-1"></i> Espèces
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                            {org.species.slice(0, 4).map((sp, idx) => (
                                <span
                                    key={idx}
                                    className="badge"
                                    style={{ background: '#7ac14215', color: '#7ac142' }}
                                >
                                    {sp}
                                </span>
                            ))}
                            {org.species.length > 4 && (
                                <span className="badge bg-secondary">+{org.species.length - 4}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Horaires & Urgences */}
                <div className="d-flex gap-3 mb-3">
                    {org.hours && (
                        <div className="d-flex align-items-center">
                            <i className="fas fa-clock me-2 text-muted"></i>
                            <small className="text-muted">{org.hours}</small>
                        </div>
                    )}
                    {org.emergency_available && (
                        <span className="badge bg-danger d-flex align-items-center gap-1">
                            <i className="fas fa-ambulance"></i>
                            Urgences
                        </span>
                    )}
                    {org.available_24_7 && (
                        <span className="badge bg-success d-flex align-items-center gap-1">
                            <i className="fas fa-clock"></i>
                            24/7
                        </span>
                    )}
                </div>

                {/* Licence / Agrément */}
                {org.license_number && (
                    <div className="mb-3">
                        <small className="text-muted">
                            <i className="fas fa-id-card me-1"></i>
                            N° {org.license_number}
                        </small>
                    </div>
                )}

                {/* Langues */}
                {org.languages && org.languages.length > 0 && (
                    <div className="mb-3">
                        <small className="text-muted">
                            <i className="fas fa-language me-1"></i>
                            {org.languages.join(' / ')}
                        </small>
                    </div>
                )}
            </div>

            {/* Footer avec boutons d'action */}
            <div className="card-footer bg-white border-0 pt-0">
                <div className="d-flex gap-2">
                    {org.phone && (
                        <a
                            href={`tel:${org.phone}`}
                            className="btn btn-sm btn-outline-primary flex-fill"
                        >
                            <i className="fas fa-phone me-1"></i>
                            Appeler
                        </a>
                    )}
                    {(org.whatsapp || org.phone) && (
                        <a
                            href={formatWhatsApp(org.whatsapp || org.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm flex-fill"
                            style={{ background: '#25D366', color: 'white', border: 'none' }}
                        >
                            <i className="fab fa-whatsapp me-1"></i>
                            WhatsApp
                        </a>
                    )}
                    {getDirectionsUrl() && (
                        <a
                            href={getDirectionsUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                        >
                            <i className="fas fa-directions"></i>
                        </a>
                    )}
                    <Link
                        to={`/annuaire/view/${org.id}`}
                        className="btn btn-sm btn-outline-secondary"
                    >
                        <i className="fas fa-eye"></i>
                    </Link>
                </div>
                <div className="text-center mt-2">
                    <Link
                        to={`/annuaire/report/${org.id}`}
                        className="text-muted small"
                        style={{ textDecoration: 'none' }}
                    >
                        <i className="fas fa-flag me-1"></i>
                        Signaler une erreur
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrganizationCard;

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getToken } from '../../../services/api';
import Pagination from '../../components/Pagination';

const AnnuaireList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const token = getToken();

    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [countries, setCountries] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Filtres depuis URL
    const [filters, setFilters] = useState({
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || '',
        country: searchParams.get('country') || '',
        city: searchParams.get('city') || '',
        actorType: searchParams.get('actorType') || '',
        species: searchParams.getAll('species') || [],
        services: searchParams.getAll('services') || [],
        availability: searchParams.get('availability') || '',
        status: searchParams.get('status') || ''
    });

    // Options de filtres
    const categoryOptions = [
        { value: 'clinique-soins', label: 'Clinique & Soins', icon: 'fa-stethoscope', color: '#27AE60' },
        { value: 'diagnostic-labos', label: 'Diagnostic & Labos', icon: 'fa-flask', color: '#9B59B6' },
        { value: 'pharmacie-fournisseurs', label: 'Pharmacie & Fournisseurs', icon: 'fa-pills', color: '#E74C3C' },
        { value: 'filieres-services', label: 'Filières & Services', icon: 'fa-tractor', color: '#F39C12' },
        { value: 'formation-institutions', label: 'Formation & Institutions', icon: 'fa-university', color: '#3498DB' }
    ];

    const actorTypes = [
        { value: 'veterinarian', label: 'Vétérinaire' },
        { value: 'clinic', label: 'Clinique' },
        { value: 'hospital', label: 'Hôpital' },
        { value: 'laboratory', label: 'Laboratoire' },
        { value: 'pharmacy', label: 'Pharmacie' },
        { value: 'distributor', label: 'Distributeur' },
        { value: 'school', label: 'École / Faculté' },
        { value: 'institution', label: 'Institution' },
        { value: 'ngo', label: 'ONG / Projet' }
    ];

    const speciesOptions = [
        { value: 'bovine', label: 'Bovins' },
        { value: 'ovine-caprine', label: 'Ovins-Caprins' },
        { value: 'poultry', label: 'Volailles' },
        { value: 'swine', label: 'Porcins' },
        { value: 'pets', label: 'Compagnie' },
        { value: 'equine', label: 'Équins' },
        { value: 'aquaculture', label: 'Aquaculture' },
        { value: 'wildlife', label: 'Faune sauvage' }
    ];

    const statusOptions = [
        { value: 'declared', label: 'Déclaré', color: '#95a5a6' },
        { value: 'verified', label: 'Vérifié', color: '#27ae60' },
        { value: 'accredited', label: 'Accrédité', color: '#f39c12' }
    ];

    useEffect(() => {
        fetchOrganizations();
        fetchCountries();
    }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, itemsPerPage]);

    const fetchOrganizations = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else if (value) {
                params.set(key, value);
            }
        });

        const res = await api.get(`/mapping/organizations?${params.toString()}`, token);
        if (res.success) {
            const sorted = (res.data || []).sort((a, b) => {
                const order = { accredited: 0, verified: 1, declared: 2 };
                return (order[a.verification_status] || 2) - (order[b.verification_status] || 2);
            });
            setOrganizations(sorted);
        }
        setLoading(false);
    };

    const fetchCountries = async () => {
        const res = await api.get('/mapping/countries', token);
        if (res.success) setCountries(res.data || []);
    };

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                v.forEach(val => params.append(k, val));
            } else if (v && v !== '') {
                params.set(k, v);
            }
        });
        setSearchParams(params);
    };

    const toggleArrayFilter = (key, value) => {
        const current = filters[key] || [];
        const newValue = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        updateFilter(key, newValue);
    };

    const clearFilters = () => {
        const emptyFilters = {
            q: '', category: '', country: '', city: '',
            actorType: '', species: [], services: [], availability: '', status: ''
        };
        setFilters(emptyFilters);
        setSearchParams({});
    };

    const activeFiltersCount = Object.values(filters).filter(v =>
        Array.isArray(v) ? v.length > 0 : Boolean(v)
    ).length;

    // Pagination
    const totalItems = organizations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrganizations = organizations.slice(startIndex, startIndex + itemsPerPage);

    // Status badge component
    const StatusBadge = ({ status }) => {
        const config = {
            declared: { label: 'Déclaré', color: '#95a5a6', icon: 'fa-file-alt' },
            verified: { label: 'Vérifié', color: '#27ae60', icon: 'fa-check-circle' },
            accredited: { label: 'Accrédité', color: '#f39c12', icon: 'fa-award' }
        };
        const s = config[status] || config.declared;
        return (
            <span className="badge d-inline-flex align-items-center gap-1" style={{ background: s.color, fontSize: '11px' }}>
                <i className={`fas ${s.icon}`}></i> {s.label}
            </span>
        );
    };

    // Type icon component
    const TypeIcon = ({ type }) => {
        const icons = {
            veterinarian: 'fa-user-md',
            clinic: 'fa-clinic-medical',
            hospital: 'fa-hospital',
            laboratory: 'fa-flask',
            pharmacy: 'fa-pills',
            distributor: 'fa-truck',
            school: 'fa-graduation-cap',
            institution: 'fa-landmark',
            ngo: 'fa-hands-helping'
        };
        return <i className={`fas ${icons[type] || 'fa-building'}`}></i>;
    };

    return (
        <>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-0" style={{ fontWeight: '700' }}>Annuaire</h2>
                    <small className="text-muted">{organizations.length} établissement(s)</small>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/annuaire" className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-arrow-left me-1"></i> Retour
                    </Link>
                    <Link
                        to="/annuaire/new"
                        className="btn btn-primary btn-sm"
                        style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                    >
                        <i className="fas fa-plus me-1"></i> Ajouter
                    </Link>
                </div>
            </div>

            {/* Barre de recherche principale */}
            <div className="card mb-3 border-0 shadow-sm">
                <div className="card-body py-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-lg-4">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white"><i className="fas fa-search text-muted"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher un établissement..."
                                    value={filters.q}
                                    onChange={(e) => updateFilter('q', e.target.value)}
                                />
                                {filters.q && (
                                    <button className="btn btn-outline-secondary" onClick={() => updateFilter('q', '')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <select
                                className="form-select form-select-sm"
                                value={filters.country}
                                onChange={(e) => updateFilter('country', e.target.value)}
                            >
                                <option value="">Tous les pays</option>
                                {countries.map((c, idx) => (
                                    <option key={idx} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-2">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Ville..."
                                value={filters.city}
                                onChange={(e) => updateFilter('city', e.target.value)}
                            />
                        </div>
                        <div className="col-lg-2">
                            <select
                                className="form-select form-select-sm"
                                value={filters.actorType}
                                onChange={(e) => updateFilter('actorType', e.target.value)}
                            >
                                <option value="">Type d'acteur</option>
                                {actorTypes.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-2 d-flex gap-2">
                            <button
                                className={`btn btn-sm flex-fill ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <i className="fas fa-sliders-h me-1"></i>
                                Filtres
                                {activeFiltersCount > 0 && (
                                    <span className="badge bg-white text-primary ms-1">{activeFiltersCount}</span>
                                )}
                            </button>
                            <div className="btn-group btn-group-sm">
                                <button
                                    className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('list')}
                                    title="Vue liste"
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                                <button
                                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Vue grille"
                                >
                                    <i className="fas fa-th-large"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zone de filtres avancés extensible */}
                {showFilters && (
                    <div className="card-footer bg-light border-top">
                        <div className="row g-3">
                            {/* Catégories */}
                            <div className="col-12">
                                <label className="form-label small text-muted mb-2">Catégorie</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {categoryOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`btn btn-sm d-flex align-items-center gap-2 ${filters.category === opt.value ? '' : 'btn-outline-secondary'}`}
                                            style={filters.category === opt.value ? { background: opt.color, borderColor: opt.color, color: 'white' } : {}}
                                            onClick={() => updateFilter('category', filters.category === opt.value ? '' : opt.value)}
                                        >
                                            <i className={`fas ${opt.icon}`}></i>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Espèces */}
                            <div className="col-md-6">
                                <label className="form-label small text-muted mb-2">
                                    <i className="fas fa-paw me-1"></i> Espèces / Filières
                                </label>
                                <div className="d-flex flex-wrap gap-1">
                                    {speciesOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`btn btn-sm ${filters.species?.includes(opt.value) ? 'btn-success' : 'btn-outline-secondary'}`}
                                            onClick={() => toggleArrayFilter('species', opt.value)}
                                            style={{ fontSize: '12px', padding: '4px 10px' }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Statut */}
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-2">
                                    <i className="fas fa-shield-alt me-1"></i> Statut de confiance
                                </label>
                                <div className="d-flex flex-wrap gap-1">
                                    {statusOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`btn btn-sm ${filters.status === opt.value ? '' : 'btn-outline-secondary'}`}
                                            style={filters.status === opt.value ? { background: opt.color, borderColor: opt.color, color: 'white' } : {}}
                                            onClick={() => updateFilter('status', filters.status === opt.value ? '' : opt.value)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Options supplémentaires */}
                            <div className="col-md-3">
                                <label className="form-label small text-muted mb-2">
                                    <i className="fas fa-clock me-1"></i> Disponibilité
                                </label>
                                <div className="d-flex flex-wrap gap-1">
                                    <button
                                        className={`btn btn-sm ${filters.availability === '24-7' ? 'btn-info' : 'btn-outline-secondary'}`}
                                        onClick={() => updateFilter('availability', filters.availability === '24-7' ? '' : '24-7')}
                                    >
                                        24/7
                                    </button>
                                    <button
                                        className={`btn btn-sm ${filters.availability === 'emergency' ? 'btn-danger' : 'btn-outline-secondary'}`}
                                        onClick={() => updateFilter('availability', filters.availability === 'emergency' ? '' : 'emergency')}
                                    >
                                        <i className="fas fa-ambulance me-1"></i> Urgences
                                    </button>
                                </div>
                            </div>

                            {/* Bouton effacer */}
                            {activeFiltersCount > 0 && (
                                <div className="col-12 text-end">
                                    <button className="btn btn-sm btn-link text-danger" onClick={clearFilters}>
                                        <i className="fas fa-times me-1"></i> Effacer tous les filtres
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Résultats */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : paginatedOrganizations.length > 0 ? (
                <>
                    {viewMode === 'list' ? (
                        /* Vue Liste */
                        <div className="card border-0 shadow-sm">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: '35%' }}>Établissement</th>
                                            <th style={{ width: '20%' }}>Localisation</th>
                                            <th style={{ width: '15%' }}>Contact</th>
                                            <th style={{ width: '15%' }}>Statut</th>
                                            <th style={{ width: '15%' }} className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedOrganizations.map(org => (
                                            <tr key={org.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="me-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '10px',
                                                                background: '#f8f9fa',
                                                                color: '#354e84'
                                                            }}
                                                        >
                                                            <TypeIcon type={org.actor_type} />
                                                        </div>
                                                        <div>
                                                            <Link to={`/annuaire/view/${org.id}`} className="fw-semibold text-dark text-decoration-none">
                                                                {org.name}
                                                            </Link>
                                                            <div className="d-flex gap-1 mt-1">
                                                                {org.services?.slice(0, 2).map((s, i) => (
                                                                    <span key={i} className="badge bg-light text-muted" style={{ fontSize: '10px' }}>{s}</span>
                                                                ))}
                                                                {org.services?.length > 2 && (
                                                                    <span className="badge bg-light text-muted" style={{ fontSize: '10px' }}>+{org.services.length - 2}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <i className="fas fa-map-marker-alt text-danger me-1"></i>
                                                        {org.city}{org.country ? `, ${org.country}` : ''}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        {org.phone && (
                                                            <a href={`tel:${org.phone}`} className="text-primary" title={org.phone}>
                                                                <i className="fas fa-phone"></i>
                                                            </a>
                                                        )}
                                                        {org.whatsapp && (
                                                            <a href={`https://wa.me/${org.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366' }} title="WhatsApp">
                                                                <i className="fab fa-whatsapp"></i>
                                                            </a>
                                                        )}
                                                        {org.email && (
                                                            <a href={`mailto:${org.email}`} className="text-muted" title={org.email}>
                                                                <i className="fas fa-envelope"></i>
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <StatusBadge status={org.verification_status} />
                                                    {org.emergency_available && (
                                                        <span className="badge bg-danger ms-1" style={{ fontSize: '10px' }}>
                                                            <i className="fas fa-ambulance"></i>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <Link to={`/annuaire/view/${org.id}`} className="btn btn-outline-primary" title="Voir">
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        <Link to={`/annuaire/edit/${org.id}`} className="btn btn-outline-secondary" title="Modifier">
                                                            <i className="fas fa-edit"></i>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalItems > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    itemName="établissements"
                                    itemsPerPageOptions={[12, 24, 50]}
                                />
                            )}
                        </div>
                    ) : (
                        /* Vue Grille - Cards compactes */
                        <>
                            <div className="row g-3">
                                {paginatedOrganizations.map(org => (
                                    <div key={org.id} className="col-md-6 col-lg-4">
                                        <div className="card h-100 border-0 shadow-sm" style={{ transition: 'transform 0.2s' }}>
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-start justify-content-between mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="me-2 d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                borderRadius: '8px',
                                                                background: '#f0f0f0',
                                                                color: '#354e84'
                                                            }}
                                                        >
                                                            <TypeIcon type={org.actor_type} />
                                                        </div>
                                                        <div>
                                                            <Link to={`/annuaire/view/${org.id}`} className="fw-semibold text-dark text-decoration-none d-block" style={{ fontSize: '14px' }}>
                                                                {org.name}
                                                            </Link>
                                                            <small className="text-muted">
                                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                                {org.city}{org.country ? `, ${org.country}` : ''}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={org.verification_status} />
                                                </div>

                                                {/* Services */}
                                                {org.services?.length > 0 && (
                                                    <div className="mb-2">
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {org.services.slice(0, 3).map((s, i) => (
                                                                <span key={i} className="badge" style={{ background: '#354e8415', color: '#354e84', fontSize: '10px' }}>{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="d-flex gap-2 pt-2 border-top">
                                                    {org.phone && (
                                                        <a href={`tel:${org.phone}`} className="btn btn-sm btn-outline-primary flex-fill py-1">
                                                            <i className="fas fa-phone me-1"></i> Appeler
                                                        </a>
                                                    )}
                                                    {(org.whatsapp || org.phone) && (
                                                        <a
                                                            href={`https://wa.me/${(org.whatsapp || org.phone).replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm flex-fill py-1"
                                                            style={{ background: '#25D366', color: 'white', border: 'none' }}
                                                        >
                                                            <i className="fab fa-whatsapp"></i>
                                                        </a>
                                                    )}
                                                    <Link to={`/annuaire/view/${org.id}`} className="btn btn-sm btn-outline-secondary py-1">
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination pour vue grille */}
                            {totalItems > 0 && (
                                <div className="card mt-3 border-0 shadow-sm">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={totalItems}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={setItemsPerPage}
                                        itemName="établissements"
                                        itemsPerPageOptions={[12, 24, 50]}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="fas fa-search fa-3x text-muted mb-3 opacity-50"></i>
                        <h5>Aucun résultat</h5>
                        <p className="text-muted mb-3">Essayez de modifier vos critères de recherche</p>
                        <button className="btn btn-outline-primary" onClick={clearFilters}>
                            <i className="fas fa-times me-1"></i> Effacer les filtres
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AnnuaireList;

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const typeLabels = {
    clinics: { label: 'Cliniques & Cabinets', icon: '🏥' },
    hospitals: { label: 'Hôpitaux Vétérinaires', icon: '🏨' },
    emergency: { label: 'Urgences & Garde', icon: '🚨' },
    labs: { label: 'Laboratoires', icon: '🔬' },
    pharmacies: { label: 'Pharmacies', icon: '💊' },
    distributors: { label: 'Distributeurs', icon: '🚛' },
    mobile: { label: 'Services Mobiles', icon: '🚐' },
    ngo: { label: 'ONG & Projets', icon: '🌍' },
    schools: { label: 'Écoles & Facultés', icon: '🎓' },
    training: { label: 'Centres de Formation', icon: '📚' },
    official: { label: 'Services Officiels', icon: '🏛️' },
    focal: { label: 'Points Focaux', icon: '📍' },
};

const OrganizationsList = () => {
    const { type } = useParams();
    const token = getToken();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [countryFilter, setCountryFilter] = useState('all');
    const [countries, setCountries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: type || 'clinics',
        description: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        latitude: '',
        longitude: '',
        status: 'active'
    });

    const typeInfo = typeLabels[type] || { label: 'Organisations', icon: '🏢' };

    useEffect(() => {
        fetchOrganizations();
        fetchCountries();
    }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOrganizations = async () => {
        const endpoint = type ? `/mapping/organizations?type=${type}` : '/mapping/organizations';
        const res = await api.get(endpoint, token);
        if (res.success) setOrganizations(res.data || []);
        setLoading(false);
    };

    const fetchCountries = async () => {
        const res = await api.get('/mapping/countries', token);
        if (res.success) setCountries(res.data || []);
    };

    const openModal = (org = null) => {
        if (org) {
            setEditingOrg(org);
            setFormData({
                name: org.name || '',
                type: org.type || type || 'clinics',
                description: org.description || '',
                address: org.address || '',
                city: org.city || '',
                country: org.country || '',
                phone: org.phone || '',
                email: org.email || '',
                website: org.website || '',
                latitude: org.latitude || '',
                longitude: org.longitude || '',
                status: org.status || 'active'
            });
        } else {
            setEditingOrg(null);
            setFormData({
                name: '',
                type: type || 'clinics',
                description: '',
                address: '',
                city: '',
                country: '',
                phone: '',
                email: '',
                website: '',
                latitude: '',
                longitude: '',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            setToast({ message: 'Le nom est requis', type: 'error' });
            return;
        }

        const res = editingOrg
            ? await api.put(`/mapping/organizations/${editingOrg.id}`, formData, token)
            : await api.post('/mapping/organizations', formData, token);

        if (res.success) {
            setToast({ message: editingOrg ? 'Organisation mise à jour' : 'Organisation créée', type: 'success' });
            setShowModal(false);
            fetchOrganizations();
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette organisation ?')) {
            const res = await api.delete(`/mapping/organizations/${id}`, token);
            if (res.success) {
                setToast({ message: 'Organisation supprimée', type: 'success' });
                fetchOrganizations();
            } else {
                setToast({ message: res.message || 'Erreur', type: 'error' });
            }
        }
    };

    const filteredOrganizations = organizations.filter(org => {
        const name = (org.name || '').toLowerCase();
        const matchesSearch = name.includes(searchQuery.toLowerCase());
        const matchesCountry = countryFilter === 'all' || org.country === countryFilter;
        return matchesSearch && matchesCountry;
    });

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

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingOrg ? 'Modifier l\'organisation' : 'Nouvelle organisation'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Nom *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Type</label>
                                                <select
                                                    className="form-select"
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleChange}
                                                >
                                                    {Object.entries(typeLabels).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.icon} {val.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Adresse</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="row">
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Ville</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Pays</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="country"
                                                            value={formData.country}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Téléphone</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Site web</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="row">
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Latitude</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="latitude"
                                                            value={formData.latitude}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label className="form-label">Longitude</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="longitude"
                                                            value={formData.longitude}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Statut</label>
                                                <select
                                                    className="form-select"
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                >
                                                    <option value="active">Actif</option>
                                                    <option value="inactive">Inactif</option>
                                                    <option value="pending">En attente</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{
                                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                                        border: 'none'
                                    }}>
                                        {editingOrg ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <span style={{ fontSize: '32px', marginRight: '12px' }}>{typeInfo.icon}</span>
                    <div>
                        <h2 className="mb-1" style={{ fontWeight: '700' }}>{typeInfo.label}</h2>
                        <p className="text-muted mb-0">{organizations.length} établissements</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/annuaire" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <button className="btn btn-primary" onClick={() => openModal()} style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        border: 'none'
                    }}>
                        <i className="fas fa-plus me-2"></i> Ajouter
                    </button>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text"><i className="fas fa-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                            >
                                <option value="all">Tous les pays</option>
                                {countries.map((country, idx) => (
                                    <option key={idx} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Ville</th>
                                    <th>Pays</th>
                                    <th>Contact</th>
                                    <th>Statut</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrganizations.length > 0 ? (
                                    filteredOrganizations.map(org => (
                                        <tr key={org.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span style={{ fontSize: '24px', marginRight: '10px' }}>
                                                        {typeLabels[org.type]?.icon || '🏢'}
                                                    </span>
                                                    <div>
                                                        <h6 className="mb-0">{org.name}</h6>
                                                        {org.address && <small className="text-muted">{org.address}</small>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{org.city || '-'}</td>
                                            <td>{org.country || '-'}</td>
                                            <td>
                                                {org.phone && <small className="d-block"><i className="fas fa-phone me-1"></i>{org.phone}</small>}
                                                {org.email && <small className="d-block"><i className="fas fa-envelope me-1"></i>{org.email}</small>}
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    org.status === 'active' ? 'bg-success' :
                                                    org.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                                                }`}>
                                                    {org.status === 'active' ? 'Actif' :
                                                     org.status === 'pending' ? 'En attente' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => openModal(org)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(org.id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-5">
                                            Aucune organisation trouvée
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrganizationsList;

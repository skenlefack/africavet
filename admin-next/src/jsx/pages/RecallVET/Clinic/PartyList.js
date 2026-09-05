import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const PartyList = () => {
    const token = getToken();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [partyType, setPartyType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchParties();
    }, [search, partyType, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchParties = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/parties?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        if (partyType) endpoint += `&party_type=${partyType}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setParties(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const typeBadge = (type) => {
        const colors = { individual: 'info', company: 'primary', organization: 'warning', government: 'secondary' };
        const labels = { individual: 'Individu', company: 'Entreprise', organization: 'Organisation', government: 'Gouvernement' };
        return <span className={`badge bg-${colors[type] || 'secondary'}`}>{labels[type] || type}</span>;
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-users me-2"></i>Clients & Parties</h4>
                <Link to="/recallvet/clinic/parties/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="Rechercher par nom, email, téléphone..."
                                value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={partyType} onChange={e => { setPartyType(e.target.value); setCurrentPage(1); }}>
                                <option value="">Tous les types</option>
                                <option value="individual">Individu</option>
                                <option value="company">Entreprise</option>
                                <option value="organization">Organisation</option>
                                <option value="government">Gouvernement</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : parties.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-users fa-3x mb-3 d-block"></i>Aucun client trouvé
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom</th>
                                        <th>Type</th>
                                        <th>Téléphone</th>
                                        <th>Email</th>
                                        <th>Ville</th>
                                        <th>Animaux</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parties.map(p => (
                                        <tr key={p.id}>
                                            <td><code>{p.party_code}</code></td>
                                            <td><strong>{p.display_name}</strong></td>
                                            <td>{typeBadge(p.party_type)}</td>
                                            <td>{p.phone_primary || '-'}</td>
                                            <td>{p.email || '-'}</td>
                                            <td>{p.city || '-'}</td>
                                            <td><span className="badge bg-light text-dark">{p.animal_count || 0}</span></td>
                                            <td>
                                                <Link to={`/recallvet/clinic/parties/${p.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/recallvet/clinic/parties/${p.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {totalItems > 0 && (
                    <div className="card-footer">
                        <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)}
                            totalItems={totalItems} itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage} onItemsPerPageChange={v => { setItemsPerPage(v); setCurrentPage(1); }}
                            itemName="clients" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyList;

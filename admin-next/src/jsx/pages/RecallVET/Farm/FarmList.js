import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const FarmList = () => {
    const token = getToken();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchFarms();
    }, [search, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchFarms = async () => {
        setLoading(true);
        let endpoint = `/v1/farm/farms?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setFarms(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-tractor me-2"></i>Exploitations</h4>
                <Link to="/recallvet/farm/farms/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle exploitation
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="Rechercher par nom, code, propriétaire..."
                                value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : farms.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-tractor fa-3x mb-3 d-block"></i>Aucune exploitation trouvée
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom</th>
                                        <th>Type</th>
                                        <th>Propriétaire</th>
                                        <th>Région</th>
                                        <th>Troupeaux</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {farms.map(f => (
                                        <tr key={f.id}>
                                            <td><code>{f.farm_code}</code></td>
                                            <td><strong>{f.name}</strong></td>
                                            <td>{f.farm_type || '-'}</td>
                                            <td>{f.owner_name || '-'}</td>
                                            <td>{f.region || '-'}</td>
                                            <td><span className="badge bg-light text-dark">{f.herd_count || 0}</span></td>
                                            <td>
                                                <Link to={`/recallvet/farm/farms/${f.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/recallvet/farm/farms/${f.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="exploitations" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FarmList;

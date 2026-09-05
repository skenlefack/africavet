import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const SupplierList = () => {
    const token = getToken();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchSuppliers();
    }, [search, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSuppliers = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/suppliers?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setSuppliers(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-truck me-2"></i>Fournisseurs</h4>
                <Link to="/recallvet/pharmacy/suppliers/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau fournisseur
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="Rechercher par nom, contact..."
                                value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : suppliers.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-truck fa-3x mb-3 d-block"></i>Aucun fournisseur trouvé
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nom</th>
                                        <th>Contact</th>
                                        <th>Téléphone</th>
                                        <th>Email</th>
                                        <th>Ville</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map(s => (
                                        <tr key={s.id}>
                                            <td><strong>{s.name}</strong></td>
                                            <td>{s.contact_person || '-'}</td>
                                            <td>{s.phone || '-'}</td>
                                            <td>{s.email || '-'}</td>
                                            <td>{s.city || '-'}</td>
                                            <td>
                                                <Link to={`/recallvet/pharmacy/suppliers/${s.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="fournisseurs" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierList;

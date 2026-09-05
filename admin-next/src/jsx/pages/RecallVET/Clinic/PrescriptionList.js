import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const PrescriptionList = () => {
    const token = getToken();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    const statusColors = { draft: 'secondary', active: 'primary', dispensed: 'success', expired: 'danger', cancelled: 'warning' };
    const statusLabels = { draft: 'Brouillon', active: 'Active', dispensed: 'Délivrée', expired: 'Expirée', cancelled: 'Annulée' };

    useEffect(() => {
        fetchPrescriptions();
    }, [statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPrescriptions = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/prescriptions?page=${currentPage}&limit=${itemsPerPage}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setPrescriptions(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-prescription me-2"></i>Ordonnances</h4>
                <Link to="/recallvet/clinic/prescriptions/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle ordonnance
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                                <option value="">Tous les statuts</option>
                                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : prescriptions.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-prescription fa-3x mb-3 d-block"></i>Aucune ordonnance trouvée
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>N°</th>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Prescripteur</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map(p => (
                                        <tr key={p.id}>
                                            <td><code>{p.prescription_number || p.id}</code></td>
                                            <td>{p.prescription_date ? new Date(p.prescription_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{p.animal_name || '-'}</strong></td>
                                            <td>{p.prescriber_name || '-'}</td>
                                            <td><span className={`badge bg-${statusColors[p.status] || 'secondary'}`}>{statusLabels[p.status] || p.status}</span></td>
                                            <td>
                                                <Link to={`/recallvet/clinic/prescriptions/${p.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/recallvet/clinic/prescriptions/${p.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="ordonnances" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrescriptionList;

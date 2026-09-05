import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const EncounterList = () => {
    const token = getToken();
    const [encounters, setEncounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    const statusColors = { draft: 'secondary', in_progress: 'info', signed: 'success', amended: 'warning' };
    const statusLabels = { draft: 'Brouillon', in_progress: 'En cours', signed: 'Signé', amended: 'Amendé' };

    useEffect(() => {
        fetchEncounters();
    }, [dateFrom, dateTo, statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchEncounters = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/encounters?page=${currentPage}&limit=${itemsPerPage}`;
        if (dateFrom) endpoint += `&date_from=${dateFrom}`;
        if (dateTo) endpoint += `&date_to=${dateTo}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setEncounters(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-notes-medical me-2"></i>Consultations</h4>
                <Link to="/recallvet/clinic/encounters/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle consultation
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <input type="date" className="form-control" placeholder="Date début" value={dateFrom}
                                onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <div className="col-md-3">
                            <input type="date" className="form-control" placeholder="Date fin" value={dateTo}
                                onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} />
                        </div>
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
                    ) : encounters.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-notes-medical fa-3x mb-3 d-block"></i>Aucune consultation trouvée
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Propriétaire</th>
                                        <th>Type</th>
                                        <th>Statut cas</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {encounters.map(e => (
                                        <tr key={e.id}>
                                            <td>{e.encounter_date ? new Date(e.encounter_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{e.animal_name || '-'}</strong></td>
                                            <td>{e.owner_name || '-'}</td>
                                            <td>{e.encounter_type || '-'}</td>
                                            <td>{e.case_status || '-'}</td>
                                            <td><span className={`badge bg-${statusColors[e.status] || 'secondary'}`}>{statusLabels[e.status] || e.status}</span></td>
                                            <td>
                                                <Link to={`/recallvet/clinic/encounters/${e.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/recallvet/clinic/encounters/${e.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="consultations" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EncounterList;

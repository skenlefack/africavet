import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const HealthEventList = () => {
    const token = getToken();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    const statusColors = { active: 'warning', monitoring: 'info', escalated: 'danger', resolved: 'success' };
    const statusLabels = { active: 'Actif', monitoring: 'Surveillance', escalated: 'Escaladé', resolved: 'Résolu' };
    const typeLabels = { disease_outbreak: 'Foyer de maladie', mortality: 'Mortalité', poisoning: 'Intoxication', parasitism: 'Parasitisme', reproductive: 'Reproductif', nutritional: 'Nutritionnel', other: 'Autre' };

    useEffect(() => {
        fetchEvents();
    }, [statusFilter, typeFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchEvents = async () => {
        setLoading(true);
        let endpoint = `/v1/farm/health-events?page=${currentPage}&limit=${itemsPerPage}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        if (typeFilter) endpoint += `&event_type=${typeFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setEvents(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const quickAction = async (id, action) => {
        const status = action === 'escalate' ? 'escalated' : 'resolved';
        const res = await api.put(`/v1/farm/health-events/${id}/status`, { status }, token);
        if (res.success) fetchEvents();
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>Événements sanitaires</h4>
                <Link to="/recallvet/farm/health-events/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau
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
                        <div className="col-md-3">
                            <select className="form-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                                <option value="">Tous les types</option>
                                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-exclamation-triangle fa-3x mb-3 d-block"></i>Aucun événement trouvé
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Exploitation</th>
                                        <th>Type</th>
                                        <th>Maladie</th>
                                        <th>Affectés</th>
                                        <th>Morts</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(ev => (
                                        <tr key={ev.id}>
                                            <td>{ev.event_date ? new Date(ev.event_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{ev.farm_name || '-'}</strong></td>
                                            <td>{typeLabels[ev.event_type] || ev.event_type}</td>
                                            <td>{ev.disease_suspected || '-'}</td>
                                            <td>{ev.animals_affected || 0}</td>
                                            <td className={ev.animals_dead > 0 ? 'text-danger fw-bold' : ''}>{ev.animals_dead || 0}</td>
                                            <td><span className={`badge bg-${statusColors[ev.status] || 'secondary'}`}>{statusLabels[ev.status] || ev.status}</span></td>
                                            <td>
                                                {ev.status === 'active' && (
                                                    <button className="btn btn-sm btn-outline-danger me-1" onClick={() => quickAction(ev.id, 'escalate')} title="Escalader">
                                                        <i className="fas fa-arrow-up"></i>
                                                    </button>
                                                )}
                                                {ev.status !== 'resolved' && (
                                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => quickAction(ev.id, 'resolve')} title="Résoudre">
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                )}
                                                <Link to={`/recallvet/farm/health-events/${ev.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="événements" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthEventList;

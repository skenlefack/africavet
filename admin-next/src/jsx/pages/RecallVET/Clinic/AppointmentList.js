import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const AppointmentList = () => {
    const token = getToken();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    const statusColors = {
        scheduled: 'secondary', confirmed: 'primary', checked_in: 'info',
        completed: 'success', cancelled: 'danger'
    };
    const statusLabels = {
        scheduled: 'Planifié', confirmed: 'Confirmé', checked_in: 'Enregistré',
        completed: 'Terminé', cancelled: 'Annulé'
    };

    useEffect(() => {
        fetchAppointments();
    }, [dateFilter, statusFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAppointments = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/appointments?page=${currentPage}&limit=${itemsPerPage}`;
        if (dateFilter) endpoint += `&date=${dateFilter}`;
        if (statusFilter) endpoint += `&status=${statusFilter}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setAppointments(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        const res = await api.put(`/v1/clinic/appointments/${id}/status`, { status }, token);
        if (res.success) fetchAppointments();
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-calendar-alt me-2"></i>Rendez-vous</h4>
                <Link to="/recallvet/clinic/appointments/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau RDV
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-4">
                            <input type="date" className="form-control" value={dateFilter}
                                onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }} />
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
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-calendar fa-3x mb-3 d-block"></i>Aucun rendez-vous trouvé
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Heure</th>
                                        <th>Patient</th>
                                        <th>Propriétaire</th>
                                        <th>Type</th>
                                        <th>Urgence</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td>{a.start_time || '-'}</td>
                                            <td><strong>{a.animal_name || '-'}</strong></td>
                                            <td>{a.owner_name || '-'}</td>
                                            <td>{a.appointment_type || '-'}</td>
                                            <td>{a.urgency === 'urgent' ? <span className="badge bg-danger">Urgent</span> : a.urgency || '-'}</td>
                                            <td><span className={`badge bg-${statusColors[a.status] || 'secondary'}`}>{statusLabels[a.status] || a.status}</span></td>
                                            <td>
                                                {a.status === 'scheduled' && (
                                                    <button className="btn btn-sm btn-outline-info me-1" onClick={() => updateStatus(a.id, 'checked_in')} title="Check-in">
                                                        <i className="fas fa-sign-in-alt"></i>
                                                    </button>
                                                )}
                                                {(a.status === 'checked_in' || a.status === 'confirmed') && (
                                                    <Link to={`/recallvet/clinic/encounters/new?appointment_id=${a.id}`} className="btn btn-sm btn-outline-success me-1" title="Convertir en consultation">
                                                        <i className="fas fa-notes-medical"></i>
                                                    </Link>
                                                )}
                                                {a.status !== 'cancelled' && a.status !== 'completed' && (
                                                    <button className="btn btn-sm btn-outline-danger me-1" onClick={() => updateStatus(a.id, 'cancelled')} title="Annuler">
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                                <Link to={`/recallvet/clinic/appointments/${a.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="rendez-vous" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentList;

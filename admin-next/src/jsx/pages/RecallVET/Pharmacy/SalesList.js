import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const SalesList = () => {
    const token = getToken();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    const statusColors = { completed: 'success', voided: 'danger', pending: 'warning' };
    const statusLabels = { completed: 'Complétée', voided: 'Annulée', pending: 'En attente' };

    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0);

    useEffect(() => {
        fetchSales();
    }, [dateFrom, dateTo, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSales = async () => {
        setLoading(true);
        let endpoint = `/v1/pharmacy/sales?page=${currentPage}&limit=${itemsPerPage}`;
        if (dateFrom) endpoint += `&date_from=${dateFrom}`;
        if (dateTo) endpoint += `&date_to=${dateTo}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setSales(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    const voidSale = async (id) => {
        if (!window.confirm('Annuler cette vente ?')) return;
        const res = await api.put(`/v1/pharmacy/sales/${id}/void`, {}, token);
        if (res.success) fetchSales();
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-receipt me-2"></i>Ventes</h4>
                <div>
                    <Link to="/recallvet/pharmacy/dispense" className="btn btn-outline-primary me-2">
                        <i className="fas fa-prescription-bottle-alt me-1"></i>Délivrance
                    </Link>
                    <Link to="/recallvet/pharmacy/retail-sale" className="btn btn-primary">
                        <i className="fas fa-cash-register me-1"></i>Vente comptoir
                    </Link>
                </div>
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
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : sales.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-receipt fa-3x mb-3 d-block"></i>Aucune vente trouvée
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>N°</th>
                                        <th>Date</th>
                                        <th>Client</th>
                                        <th>Montant</th>
                                        <th>Paiement</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map(s => (
                                        <tr key={s.id}>
                                            <td><code>{s.sale_number || s.id}</code></td>
                                            <td>{s.sale_date ? new Date(s.sale_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td>{s.party_name || 'Comptoir'}</td>
                                            <td className="fw-bold">{formatAmount(s.total_amount)} XAF</td>
                                            <td>
                                                {s.payment_method === 'cash' ? 'Espèces' :
                                                    s.payment_method === 'mobile_money' ? 'Mobile Money' :
                                                        s.payment_method === 'card' ? 'Carte' :
                                                            s.payment_method === 'transfer' ? 'Virement' :
                                                                s.payment_method === 'credit' ? 'Crédit' : s.payment_method || '-'}
                                            </td>
                                            <td><span className={`badge bg-${statusColors[s.status] || 'secondary'}`}>{statusLabels[s.status] || s.status}</span></td>
                                            <td>
                                                <Link to={`/recallvet/pharmacy/sales/${s.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                {s.status === 'completed' && (
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => voidSale(s.id)} title="Annuler">
                                                        <i className="fas fa-ban"></i>
                                                    </button>
                                                )}
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
                            itemName="ventes" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesList;

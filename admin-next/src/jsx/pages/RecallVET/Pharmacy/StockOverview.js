import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';

const StockOverview = () => {
    const token = getToken();
    const [levels, setLevels] = useState([]);
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('levels');
    const [productFilter, setProductFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        setLoading(true);
        const [levelsRes, lotsRes] = await Promise.all([
            api.get('/v1/pharmacy/stock/levels', token),
            api.get('/v1/pharmacy/stock/lots', token)
        ]);
        if (levelsRes.success) setLevels(levelsRes.data || []);
        if (lotsRes.success) setLots(lotsRes.data || []);
        setLoading(false);
    };

    const formatAmount = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0);

    const getExpiryClass = (expiryDate) => {
        if (!expiryDate) return '';
        const days = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (days < 0) return 'table-danger';
        if (days < 30) return 'table-warning';
        if (days < 90) return 'table-info';
        return '';
    };

    const filteredLevels = levels.filter(l =>
        (!productFilter || (l.product_name || '').toLowerCase().includes(productFilter.toLowerCase())) &&
        (!locationFilter || (l.location || '').toLowerCase().includes(locationFilter.toLowerCase()))
    );

    const filteredLots = lots.filter(l =>
        (!productFilter || (l.product_name || '').toLowerCase().includes(productFilter.toLowerCase())) &&
        (!locationFilter || (l.location || '').toLowerCase().includes(locationFilter.toLowerCase()))
    );

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-warehouse me-2"></i>Stock</h4>
                <div>
                    <Link to="/recallvet/pharmacy/goods-receipts/new" className="btn btn-primary me-2">
                        <i className="fas fa-box-open me-1"></i>Réception
                    </Link>
                    <Link to="/recallvet/pharmacy/stock-movements/new" className="btn btn-outline-primary">
                        <i className="fas fa-exchange-alt me-1"></i>Mouvement
                    </Link>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-4">
                            <input type="text" className="form-control" placeholder="Filtrer par produit..."
                                value={productFilter} onChange={e => setProductFilter(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Filtrer par emplacement..."
                                value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'levels' ? 'active' : ''}`} onClick={() => setActiveTab('levels')}>
                        <i className="fas fa-chart-bar me-1"></i>Niveaux de stock ({filteredLevels.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'lots' ? 'active' : ''}`} onClick={() => setActiveTab('lots')}>
                        <i className="fas fa-boxes me-1"></i>Lots ({filteredLots.length})
                    </button>
                </li>
            </ul>

            {activeTab === 'levels' && (
                <div className="card">
                    <div className="card-body p-0">
                        {filteredLevels.length === 0 ? (
                            <div className="text-center py-5 text-muted">Aucune donnée de stock</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Produit</th>
                                            <th>SKU</th>
                                            <th>Emplacement</th>
                                            <th>Quantité</th>
                                            <th>Seuil</th>
                                            <th>Statut</th>
                                            <th>Valeur</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLevels.map((l, idx) => (
                                            <tr key={idx} className={(l.quantity || 0) <= (l.reorder_level || 0) ? 'table-warning' : ''}>
                                                <td><strong>{l.product_name}</strong></td>
                                                <td><code>{l.sku || '-'}</code></td>
                                                <td>{l.location || 'Principal'}</td>
                                                <td className="fw-bold">{l.quantity || 0}</td>
                                                <td>{l.reorder_level || '-'}</td>
                                                <td>
                                                    {(l.quantity || 0) <= 0 ? <span className="badge bg-danger">Rupture</span>
                                                        : (l.quantity || 0) <= (l.reorder_level || 0) ? <span className="badge bg-warning">Bas</span>
                                                            : <span className="badge bg-success">OK</span>}
                                                </td>
                                                <td>{formatAmount((l.quantity || 0) * (l.unit_cost || l.unit_price || 0))} XAF</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'lots' && (
                <div className="card">
                    <div className="card-body p-0">
                        {filteredLots.length === 0 ? (
                            <div className="text-center py-5 text-muted">Aucun lot trouvé</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Produit</th>
                                            <th>N° lot</th>
                                            <th>Batch</th>
                                            <th>Expiration</th>
                                            <th>Emplacement</th>
                                            <th>Quantité</th>
                                            <th>Coût unit.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLots.map((l, idx) => (
                                            <tr key={idx} className={getExpiryClass(l.expiry_date)}>
                                                <td><strong>{l.product_name}</strong></td>
                                                <td><code>{l.lot_number || '-'}</code></td>
                                                <td>{l.batch || '-'}</td>
                                                <td>
                                                    {l.expiry_date ? (
                                                        <span className={new Date(l.expiry_date) < new Date() ? 'text-danger fw-bold' : ''}>
                                                            {new Date(l.expiry_date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td>{l.location || 'Principal'}</td>
                                                <td className="fw-bold">{l.quantity || 0}</td>
                                                <td>{formatAmount(l.unit_cost || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockOverview;

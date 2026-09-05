import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const VaccinationList = () => {
    const token = getToken();
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animalFilter, setAnimalFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchVaccinations();
    }, [animalFilter, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchVaccinations = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/vaccinations?page=${currentPage}&limit=${itemsPerPage}`;
        if (animalFilter) endpoint += `&animal_search=${encodeURIComponent(animalFilter)}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setVaccinations(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-syringe me-2"></i>Vaccinations</h4>
                <Link to="/recallvet/clinic/vaccinations/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouvelle vaccination
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="Filtrer par animal..."
                                value={animalFilter} onChange={e => { setAnimalFilter(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : vaccinations.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-syringe fa-3x mb-3 d-block"></i>Aucune vaccination trouvée
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Vaccin</th>
                                        <th>Lot</th>
                                        <th>Dose</th>
                                        <th>Prochain rappel</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vaccinations.map(v => (
                                        <tr key={v.id}>
                                            <td>{v.vaccination_date ? new Date(v.vaccination_date).toLocaleDateString('fr-FR') : '-'}</td>
                                            <td><strong>{v.animal_name || '-'}</strong></td>
                                            <td>{v.product_name || '-'}</td>
                                            <td><code>{v.lot_number || '-'}</code></td>
                                            <td>{v.dose || '-'}</td>
                                            <td>
                                                {v.next_due_date ? (
                                                    <span className={new Date(v.next_due_date) < new Date() ? 'text-danger fw-bold' : ''}>
                                                        {new Date(v.next_due_date).toLocaleDateString('fr-FR')}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <Link to={`/recallvet/clinic/vaccinations/${v.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/recallvet/clinic/vaccinations/${v.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="vaccinations" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaccinationList;

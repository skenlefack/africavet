import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../../services/api';
import Pagination from '../../../components/Pagination';

const AnimalList = () => {
    const token = getToken();
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [species, setSpecies] = useState('');
    const [speciesList, setSpeciesList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchSpecies();
    }, []);

    useEffect(() => {
        fetchAnimals();
    }, [search, species, currentPage, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSpecies = async () => {
        const res = await api.get('/v1/clinic/ref/species', token);
        if (res.success) setSpeciesList(res.data || []);
    };

    const fetchAnimals = async () => {
        setLoading(true);
        let endpoint = `/v1/clinic/animals?page=${currentPage}&limit=${itemsPerPage}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        if (species) endpoint += `&species=${species}`;
        const res = await api.get(endpoint, token);
        if (res.success) {
            setAnimals(res.data || []);
            setTotalItems(res.total || (res.data || []).length);
        }
        setLoading(false);
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0"><i className="fas fa-paw me-2"></i>Animaux</h4>
                <Link to="/recallvet/clinic/animals/new" className="btn btn-primary">
                    <i className="fas fa-plus me-1"></i>Nouveau
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="row g-2">
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="Rechercher par nom, code, puce..."
                                value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" value={species} onChange={e => { setSpecies(e.target.value); setCurrentPage(1); }}>
                                <option value="">Toutes les espèces</option>
                                {speciesList.map(s => <option key={s.id || s.code} value={s.code || s.id}>{s.name_fr || s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                    ) : animals.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-paw fa-3x mb-3 d-block"></i>Aucun animal trouvé
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Code</th>
                                        <th>Nom</th>
                                        <th>Espèce</th>
                                        <th>Race</th>
                                        <th>Sexe</th>
                                        <th>Propriétaire</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {animals.map(a => (
                                        <tr key={a.id}>
                                            <td><code>{a.animal_code}</code></td>
                                            <td><strong>{a.name}</strong></td>
                                            <td>{a.species_name || a.species || '-'}</td>
                                            <td>{a.breed_name || a.breed || '-'}</td>
                                            <td>{a.sex === 'M' ? 'Mâle' : a.sex === 'F' ? 'Femelle' : '-'}</td>
                                            <td>{a.owner_name || '-'}</td>
                                            <td>
                                                <Link to={`/recallvet/clinic/animals/${a.id}`} className="btn btn-sm btn-outline-info me-1" title="Voir">
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link to={`/recallvet/clinic/animals/${a.id}/edit`} className="btn btn-sm btn-outline-primary" title="Modifier">
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
                            itemName="animaux" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimalList;

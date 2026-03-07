import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const MenusList = () => {
    const navigate = useNavigate();
    const token = getToken();
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchMenus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMenus = async () => {
        const res = await api.get('/menus', token);
        if (res.success) {
            setMenus(res.data || []);
            if (res.data?.length > 0 && !selectedMenu) {
                setSelectedMenu(res.data[0]);
                fetchMenuItems(res.data[0].id);
            }
        }
        setLoading(false);
    };

    const fetchMenuItems = async (menuId) => {
        const res = await api.get(`/menus/${menuId}/items`, token);
        if (res.success) setMenuItems(res.data || []);
    };

    const handleSelectMenu = (menu) => {
        setSelectedMenu(menu);
        fetchMenuItems(menu.id);
    };

    const handleDeleteMenu = async (id) => {
        if (window.confirm('Supprimer ce menu ?')) {
            const res = await api.delete(`/menus/${id}`, token);
            if (res.success) {
                setToast({ message: 'Menu supprimé', type: 'success' });
                setSelectedMenu(null);
                setMenuItems([]);
                fetchMenus();
            }
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm('Supprimer cet élément ?')) {
            const res = await api.delete(`/menus/items/${id}`, token);
            if (res.success) {
                setToast({ message: 'Élément supprimé', type: 'success' });
                fetchMenuItems(selectedMenu.id);
            }
        }
    };

    const moveItem = async (item, direction) => {
        const currentIndex = menuItems.findIndex(i => i.id === item.id);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= menuItems.length) return;

        const newOrder = menuItems.map((i, idx) => {
            if (idx === currentIndex) return { id: i.id, sort_order: newIndex };
            if (idx === newIndex) return { id: i.id, sort_order: currentIndex };
            return { id: i.id, sort_order: idx };
        });

        const res = await api.put(`/menus/${selectedMenu.id}/reorder`, { items: newOrder }, token);
        if (res.success) {
            fetchMenuItems(selectedMenu.id);
        }
    };

    const buildTree = (items, parentId = null) => {
        return items
            .filter(item => item.parent_id === parentId)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(item => ({
                ...item,
                children: buildTree(items, item.id)
            }));
    };

    const renderMenuItem = (item, level = 0) => (
        <React.Fragment key={item.id}>
            <tr>
                <td style={{ paddingLeft: `${level * 25 + 15}px` }}>
                    {level > 0 && <span className="text-muted me-2">└</span>}
                    <i className="fas fa-grip-vertical text-muted me-2" style={{ cursor: 'grab' }}></i>
                    {item.title || item.label_fr || item.label}
                </td>
                <td>
                    <code className="small">{item.url || (item.type === 'page' ? '/page/' + item.page_id : '#')}</code>
                </td>
                <td>
                    <span className={`badge ${
                        item.type === 'page' ? 'bg-primary' :
                        item.type === 'category' ? 'bg-info' : 'bg-secondary'
                    }`}>
                        {item.type === 'page' ? 'Page' : item.type === 'category' ? 'Catégorie' : 'Personnalisé'}
                    </span>
                </td>
                <td className="text-end">
                    <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => moveItem(item, 'up')} disabled={item.sort_order === 0}>
                            <i className="fas fa-arrow-up"></i>
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => moveItem(item, 'down')}>
                            <i className="fas fa-arrow-down"></i>
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/menus/${selectedMenu.id}/items/${item.id}`)}
                        >
                            <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => handleDeleteItem(item.id)}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
        </React.Fragment>
    );

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    const menuTree = buildTree(menuItems);

    return (
        <>
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Menus</h2>
                    <p className="text-muted mb-0">Gestion des menus de navigation</p>
                </div>
                <Link
                    to="/menus/new"
                    className="btn btn-primary"
                    style={{
                        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                        border: 'none'
                    }}
                >
                    <i className="fas fa-plus me-2"></i> Nouveau menu
                </Link>
            </div>

            <div className="row">
                {/* Liste des menus */}
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Menus</h5>
                        </div>
                        <div className="list-group list-group-flush">
                            {menus.map(menu => (
                                <div
                                    key={menu.id}
                                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedMenu?.id === menu.id ? 'active' : ''}`}
                                    onClick={() => handleSelectMenu(menu)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div>
                                        <strong>{menu.name}</strong>
                                        {menu.location && (
                                            <small className="d-block text-muted">{menu.location}</small>
                                        )}
                                    </div>
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-light"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/menus/${menu.id}`); }}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn btn-light text-danger"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu.id); }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {menus.length === 0 && (
                                <div className="list-group-item text-center text-muted py-4">
                                    Aucun menu
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Éléments du menu */}
                <div className="col-md-9">
                    {selectedMenu ? (
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Éléments de "{selectedMenu.name}"</h5>
                                <Link
                                    to={`/menus/${selectedMenu.id}/items/new`}
                                    className="btn btn-primary btn-sm"
                                >
                                    <i className="fas fa-plus me-2"></i> Ajouter
                                </Link>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Titre</th>
                                                <th>URL</th>
                                                <th>Type</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {menuTree.length > 0 ? (
                                                menuTree.map(item => renderMenuItem(item))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted py-5">
                                                        Aucun élément dans ce menu
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body text-center text-muted py-5">
                                <i className="fas fa-bars fa-3x mb-3"></i>
                                <p>Sélectionnez un menu pour gérer ses éléments</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MenusList;

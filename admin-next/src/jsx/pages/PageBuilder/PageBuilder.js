import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const blockTypes = [
    { type: 'hero', label: 'Hero Banner', icon: '🎯', description: 'Bannière principale avec titre et CTA' },
    { type: 'text', label: 'Texte', icon: '📝', description: 'Bloc de texte riche' },
    { type: 'text-image', label: 'Texte + Image', icon: '🖼️', description: 'Texte avec image à côté' },
    { type: 'features', label: 'Fonctionnalités', icon: '⭐', description: 'Grille de fonctionnalités' },
    { type: 'gallery', label: 'Galerie', icon: '🎨', description: 'Galerie d\'images' },
    { type: 'video', label: 'Vidéo', icon: '🎬', description: 'Vidéo YouTube/Vimeo' },
    { type: 'testimonials', label: 'Témoignages', icon: '💬', description: 'Carrousel de témoignages' },
    { type: 'cta', label: 'Call to Action', icon: '🔔', description: 'Bannière d\'appel à l\'action' },
    { type: 'cards', label: 'Cartes', icon: '🃏', description: 'Grille de cartes' },
    { type: 'stats', label: 'Statistiques', icon: '📊', description: 'Chiffres clés' },
    { type: 'team', label: 'Équipe', icon: '👥', description: 'Membres de l\'équipe' },
    { type: 'partners', label: 'Partenaires', icon: '🤝', description: 'Logos partenaires' },
    { type: 'accordion', label: 'Accordéon', icon: '📋', description: 'FAQ / Questions-réponses' },
    { type: 'tabs', label: 'Onglets', icon: '📑', description: 'Contenu en onglets' },
    { type: 'contact', label: 'Contact', icon: '📧', description: 'Formulaire de contact' },
    { type: 'map', label: 'Carte', icon: '🗺️', description: 'Carte Google Maps' },
    { type: 'html', label: 'HTML', icon: '💻', description: 'Code HTML personnalisé' },
    { type: 'spacer', label: 'Espacement', icon: '↕️', description: 'Espace vertical' },
];

const PageBuilder = () => {
    const { id } = useParams();
    const token = getToken();

    const [page, setPage] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeLanguage, setActiveLanguage] = useState('fr');
    const [showBlockPicker, setShowBlockPicker] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        if (id) {
            fetchPage();
        } else {
            setLoading(false);
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPage = async () => {
        const res = await api.get(`/pages/${id}`, token);
        if (res.success && res.data) {
            setPage(res.data);
            // Parse sections if it's a string (from database JSON)
            let parsedSections = [];
            if (res.data.sections) {
                try {
                    const parsed = typeof res.data.sections === 'string'
                        ? JSON.parse(res.data.sections)
                        : res.data.sections;
                    // Handle both formats: { sections: [...] } or direct array
                    if (parsed && parsed.sections && Array.isArray(parsed.sections)) {
                        parsedSections = parsed.sections;
                    } else if (Array.isArray(parsed)) {
                        parsedSections = parsed;
                    }
                } catch (e) {
                    console.error('Error parsing sections:', e);
                    parsedSections = [];
                }
            }
            setSections(parsedSections);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        // Stringify sections for database storage (wrapped in object format)
        const sectionsData = {
            sections: sections,
            settings: {
                showTableOfContents: false,
                headerStyle: 'default',
                spacing: 'normal'
            }
        };
        const dataToSave = {
            ...page,
            sections: JSON.stringify(sectionsData)
        };
        const res = await api.put(`/pages/${id}`, dataToSave, token);
        if (res.success) {
            setToast({ message: 'Page sauvegardée', type: 'success' });
        } else {
            setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setSaving(false);
    };

    const addSection = (blockType) => {
        const defaultData = getDefaultData(blockType.type);
        const newSection = {
            id: `section-${Date.now()}`,
            type: blockType.type,
            ...defaultData
        };
        setSections([...sections, newSection]);
        setShowBlockPicker(false);
    };

    const getDefaultData = (type) => {
        // Use multilingual object format compatible with existing data
        const defaults = {
            hero: { title: { fr: '', en: '' }, subtitle: { fr: '', en: '' }, background: '', button_text: '', button_url: '' },
            text: { content: { fr: '', en: '' } },
            'text-image': { title: { fr: '', en: '' }, content: { fr: '', en: '' }, image: { src: '', alt: { fr: '', en: '' } }, layout: 'text-left-image-right' },
            features: { title: { fr: '', en: '' }, items: [] },
            gallery: { images: [] },
            video: { url: '', title: { fr: '', en: '' } },
            testimonials: { items: [] },
            cta: { title: { fr: '', en: '' }, subtitle: { fr: '', en: '' }, button_text: '', button_url: '', background: '' },
            cards: { items: [] },
            stats: { items: [] },
            team: { items: [] },
            partners: { items: [] },
            accordion: { items: [] },
            tabs: { items: [] },
            contact: { title: { fr: '', en: '' }, email: '' },
            map: { address: '', lat: '', lng: '', zoom: 15 },
            html: { code: '' },
            spacer: { height: 50 }
        };
        return defaults[type] || {};
    };

    const updateSection = (index, data) => {
        const updated = [...sections];
        // Merge data directly into section (not into a nested 'data' property)
        updated[index] = { ...updated[index], ...data };
        setSections(updated);
    };

    const toggleSectionVisibility = (index) => {
        const updated = [...sections];
        updated[index].visible = !updated[index].visible;
        setSections(updated);
    };

    const deleteSection = (index) => {
        if (window.confirm('Supprimer cette section ?')) {
            setSections(sections.filter((_, i) => i !== index));
        }
    };

    const duplicateSection = (index) => {
        const section = { ...sections[index], id: Date.now() };
        const updated = [...sections];
        updated.splice(index + 1, 0, section);
        setSections(updated);
    };

    const moveSection = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= sections.length) return;

        const updated = [...sections];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setSections(updated);
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const updated = [...sections];
        const [dragged] = updated.splice(draggedIndex, 1);
        updated.splice(index, 0, dragged);
        setSections(updated);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const getBlockInfo = (type) => blockTypes.find(b => b.type === type) || { label: type, icon: '📦' };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <h3>Sélectionnez une page</h3>
                    <p className="text-muted">Choisissez une page depuis la liste pour utiliser le Page Builder</p>
                    <Link to="/pages" className="btn btn-primary">Voir les pages</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                     style={{ top: '20px', right: '20px', zIndex: 9999 }}>
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Block Picker Modal */}
            {showBlockPicker && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Ajouter un bloc</h5>
                                <button type="button" className="btn-close" onClick={() => setShowBlockPicker(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    {blockTypes.map((block) => (
                                        <div key={block.type} className="col-md-4">
                                            <div
                                                className="card h-100"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => addSection(block)}
                                            >
                                                <div className="card-body text-center py-4">
                                                    <span style={{ fontSize: '32px' }}>{block.icon}</span>
                                                    <h6 className="mt-2 mb-1">{block.label}</h6>
                                                    <small className="text-muted">{block.description}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Editor Modal */}
            {editingSection !== null && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {getBlockInfo(sections[editingSection]?.type).icon} Modifier: {getBlockInfo(sections[editingSection]?.type).label}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setEditingSection(null)}></button>
                            </div>
                            <div className="modal-body">
                                <ul className="nav nav-tabs mb-3">
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeLanguage === 'fr' ? 'active' : ''}`} onClick={() => setActiveLanguage('fr')}>Français</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeLanguage === 'en' ? 'active' : ''}`} onClick={() => setActiveLanguage('en')}>English</button>
                                    </li>
                                </ul>

                                {sections[editingSection] && (
                                    <SectionEditor
                                        section={sections[editingSection]}
                                        language={activeLanguage}
                                        onChange={(data) => updateSection(editingSection, data)}
                                    />
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditingSection(null)}>Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Page Builder</h2>
                    <p className="text-muted mb-0">{page?.title_fr || page?.title || 'Page'}</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/pages" className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i> Retour
                    </Link>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
                            border: 'none'
                        }}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-2"></i> Sauvegarder
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Sections List */}
            <div className="row">
                <div className="col-lg-8">
                    <div className="card mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Sections ({sections.length})</h5>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowBlockPicker(true)}>
                                <i className="fas fa-plus me-2"></i> Ajouter un bloc
                            </button>
                        </div>
                        <div className="card-body">
                            {sections.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="fas fa-puzzle-piece fa-3x mb-3"></i>
                                    <p>Aucune section. Cliquez sur "Ajouter un bloc" pour commencer.</p>
                                </div>
                            ) : (
                                <div className="list-group">
                                    {sections.map((section, index) => {
                                        const blockInfo = getBlockInfo(section.type);
                                        return (
                                            <div
                                                key={section.id}
                                                className={`list-group-item ${!section.visible ? 'opacity-50' : ''}`}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                style={{ cursor: 'grab' }}
                                            >
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-grip-vertical me-3 text-muted"></i>
                                                        <span style={{ fontSize: '24px', marginRight: '12px' }}>{blockInfo.icon}</span>
                                                        <div>
                                                            <h6 className="mb-0">{blockInfo.label}</h6>
                                                            <small className="text-muted">
                                                                {section.title?.fr || section.title?.en || section.id || `#${index + 1}`}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="btn-group btn-group-sm">
                                                        <button className="btn btn-outline-secondary" onClick={() => moveSection(index, 'up')} disabled={index === 0}>
                                                            <i className="fas fa-arrow-up"></i>
                                                        </button>
                                                        <button className="btn btn-outline-secondary" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1}>
                                                            <i className="fas fa-arrow-down"></i>
                                                        </button>
                                                        <button className="btn btn-outline-primary" onClick={() => setEditingSection(index)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="btn btn-outline-secondary" onClick={() => duplicateSection(index)}>
                                                            <i className="fas fa-copy"></i>
                                                        </button>
                                                        <button className={`btn ${section.visible ? 'btn-outline-success' : 'btn-outline-warning'}`} onClick={() => toggleSectionVisibility(index)}>
                                                            <i className={`fas fa-${section.visible ? 'eye' : 'eye-slash'}`}></i>
                                                        </button>
                                                        <button className="btn btn-outline-danger" onClick={() => deleteSection(index)}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    <div className="card mb-3">
                        <div className="card-header">
                            <h5 className="mb-0">Informations</h5>
                        </div>
                        <div className="card-body">
                            <dl className="mb-0">
                                <dt>Titre</dt>
                                <dd>{page?.title_fr || page?.title || '-'}</dd>
                                <dt>Slug</dt>
                                <dd><code>/{page?.slug || '-'}</code></dd>
                                <dt>Statut</dt>
                                <dd>
                                    <span className={`badge ${page?.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                        {page?.status === 'published' ? 'Publiée' : 'Brouillon'}
                                    </span>
                                </dd>
                            </dl>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Blocs disponibles</h5>
                        </div>
                        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {blockTypes.slice(0, 8).map((block) => (
                                <div
                                    key={block.type}
                                    className="d-flex align-items-center p-2 mb-2 rounded"
                                    style={{ background: '#f8f9fa', cursor: 'pointer' }}
                                    onClick={() => addSection(block)}
                                >
                                    <span style={{ fontSize: '20px', marginRight: '10px' }}>{block.icon}</span>
                                    <small>{block.label}</small>
                                </div>
                            ))}
                            <button className="btn btn-outline-primary btn-sm w-100" onClick={() => setShowBlockPicker(true)}>
                                Voir tous les blocs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Section Editor Component - supports multilingual object format {fr: '', en: ''}
const SectionEditor = ({ section, language, onChange }) => {
    const lang = language || 'fr';

    // Helper to get multilingual value
    const getMLValue = (obj, field) => {
        if (!obj) return '';
        // Support both formats: { title: { fr: '', en: '' } } and { title_fr: '', title_en: '' }
        if (obj[field] && typeof obj[field] === 'object') {
            return obj[field][lang] || '';
        }
        return obj[`${field}_${lang}`] || obj[field] || '';
    };

    // Helper to set multilingual value
    const setMLValue = (field, value) => {
        const current = section || {};
        const currentField = current[field];
        if (currentField && typeof currentField === 'object' && !Array.isArray(currentField)) {
            // Update multilingual object
            onChange({ [field]: { ...currentField, [lang]: value } });
        } else {
            // Create new multilingual object
            onChange({ [field]: { fr: lang === 'fr' ? value : '', en: lang === 'en' ? value : '', [lang]: value } });
        }
    };

    // Helper to get content (handles array of paragraphs or string)
    const getContent = () => {
        const content = section?.content;
        if (!content) return '';
        if (typeof content === 'object' && content[lang]) {
            const langContent = content[lang];
            if (Array.isArray(langContent)) {
                return langContent.map(p => p.text || p).join('\n\n');
            }
            return langContent;
        }
        return content[`content_${lang}`] || '';
    };

    // Helper to set content
    const setContent = (value) => {
        const paragraphs = value.split('\n\n').filter(p => p.trim()).map(text => ({ type: 'paragraph', text }));
        const current = section?.content || {};
        onChange({ content: { ...current, [lang]: paragraphs } });
    };

    switch (section?.type) {
        case 'hero':
        case 'cta':
            return (
                <>
                    <div className="mb-3">
                        <label className="form-label">Titre ({lang.toUpperCase()})</label>
                        <input
                            type="text"
                            className="form-control"
                            value={getMLValue(section, 'title')}
                            onChange={(e) => setMLValue('title', e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Sous-titre ({lang.toUpperCase()})</label>
                        <textarea
                            className="form-control"
                            value={getMLValue(section, 'subtitle')}
                            onChange={(e) => setMLValue('subtitle', e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <div className="mb-3">
                                <label className="form-label">Texte du bouton</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={section?.button_text || ''}
                                    onChange={(e) => onChange({ button_text: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="mb-3">
                                <label className="form-label">URL du bouton</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={section?.button_url || ''}
                                    onChange={(e) => onChange({ button_url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Image de fond (URL)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={section?.background || ''}
                            onChange={(e) => onChange({ background: e.target.value })}
                        />
                    </div>
                </>
            );

        case 'text':
            return (
                <div className="mb-3">
                    <label className="form-label">Contenu ({lang.toUpperCase()})</label>
                    <textarea
                        className="form-control"
                        value={getContent()}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        placeholder="Séparez les paragraphes par une ligne vide"
                    />
                </div>
            );

        case 'text-image':
            return (
                <>
                    <div className="mb-3">
                        <label className="form-label">Titre ({lang.toUpperCase()})</label>
                        <input
                            type="text"
                            className="form-control"
                            value={getMLValue(section, 'title')}
                            onChange={(e) => setMLValue('title', e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contenu ({lang.toUpperCase()})</label>
                        <textarea
                            className="form-control"
                            value={getContent()}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            placeholder="Séparez les paragraphes par une ligne vide"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Image (URL)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={section?.image?.src || section?.image || ''}
                            onChange={(e) => onChange({ image: { ...section?.image, src: e.target.value } })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Position de l'image</label>
                        <select
                            className="form-select"
                            value={section?.layout || 'text-left-image-right'}
                            onChange={(e) => onChange({ layout: e.target.value })}
                        >
                            <option value="text-left-image-right">Texte à gauche, Image à droite</option>
                            <option value="text-right-image-left">Texte à droite, Image à gauche</option>
                        </select>
                    </div>
                </>
            );

        case 'video':
            return (
                <>
                    <div className="mb-3">
                        <label className="form-label">URL de la vidéo (YouTube/Vimeo)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={section?.url || ''}
                            onChange={(e) => onChange({ url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Titre ({lang.toUpperCase()})</label>
                        <input
                            type="text"
                            className="form-control"
                            value={getMLValue(section, 'title')}
                            onChange={(e) => setMLValue('title', e.target.value)}
                        />
                    </div>
                </>
            );

        case 'html':
            return (
                <div className="mb-3">
                    <label className="form-label">Code HTML</label>
                    <textarea
                        className="form-control font-monospace"
                        value={section?.code || ''}
                        onChange={(e) => onChange({ code: e.target.value })}
                        rows={15}
                        style={{ fontSize: '12px' }}
                    />
                </div>
            );

        case 'spacer':
            return (
                <div className="mb-3">
                    <label className="form-label">Hauteur (px)</label>
                    <input
                        type="number"
                        className="form-control"
                        value={section?.height || 50}
                        onChange={(e) => onChange({ height: parseInt(e.target.value) })}
                    />
                </div>
            );

        case 'map':
            return (
                <>
                    <div className="mb-3">
                        <label className="form-label">Adresse</label>
                        <input
                            type="text"
                            className="form-control"
                            value={section?.address || ''}
                            onChange={(e) => onChange({ address: e.target.value })}
                        />
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <div className="mb-3">
                                <label className="form-label">Latitude</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={section?.lat || ''}
                                    onChange={(e) => onChange({ lat: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="mb-3">
                                <label className="form-label">Longitude</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={section?.lng || ''}
                                    onChange={(e) => onChange({ lng: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="mb-3">
                                <label className="form-label">Zoom</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={section?.zoom || 15}
                                    onChange={(e) => onChange({ zoom: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </>
            );

        default:
            return (
                <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Éditeur pour ce type de bloc en cours de développement.
                    <hr />
                    <pre className="mb-0" style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                        {JSON.stringify(section, null, 2)}
                    </pre>
                </div>
            );
    }
};

export default PageBuilder;

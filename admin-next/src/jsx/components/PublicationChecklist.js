import React from 'react';

const CHECKLIST_ITEMS = [
    { id: 1, label: 'Angle et public cible explicites', blocking: true },
    { id: 2, label: 'Au moins deux sources, une primaire', blocking: true },
    { id: 3, label: 'Chiffres, dates et unités vérifiés', blocking: true },
    { id: 4, label: 'Citations attribuées et fidèles', blocking: true },
    { id: 5, label: 'Pays, région et portée renseignés', blocking: true },
    { id: 6, label: 'Langue d\'origine réelle renseignée', blocking: true },
    { id: 7, label: 'Catégorie, macrothème et format corrects', blocking: true },
    { id: 8, label: 'Image autorisée, créditée et légendée', blocking: true },
    { id: 9, label: 'Conflits d\'intérêts déclarés', blocking: true, hasNA: true },
    { id: 10, label: 'Avertissement sanitaire présent', blocking: true, hasNA: true },
    { id: 11, label: 'Méta-titre 50-60 caractères', blocking: true },
    { id: 12, label: 'Méta-description 140-160 caractères', blocking: true },
    { id: 13, label: 'URL courte et canonique vérifiée', blocking: true },
    { id: 14, label: 'Pack réseaux sociaux prêt', blocking: true },
    { id: 15, label: 'Liens UTM testés', blocking: true },
    { id: 16, label: 'Heure, auteur et validation tracés', blocking: true },
];

const PublicationChecklist = ({ checklist = {}, onChange, readOnly = false, showScore = true }) => {
    const handleCheck = (id, value) => {
        if (readOnly) return;
        onChange({ ...checklist, [id]: value });
    };

    const passed = CHECKLIST_ITEMS.filter(item => checklist[item.id] === 'checked' || checklist[item.id] === 'na').length;
    const score = Math.round((passed / CHECKLIST_ITEMS.length) * 100);
    const blockingFailed = CHECKLIST_ITEMS.filter(item =>
        item.blocking && checklist[item.id] !== 'checked' && checklist[item.id] !== 'na'
    );
    const isReady = blockingFailed.length === 0;
    const barColor = score >= 80 ? '#28a745' : score >= 50 ? '#ffc107' : '#dc3545';

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="fas fa-clipboard-check me-2 text-primary"></i>Check-list prépublication</h5>
                {showScore && (
                    <span className={`badge ${isReady ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.85rem' }}>
                        {isReady ? <><i className="fas fa-check-circle me-1"></i>Prêt à publier</> : <><i className="fas fa-ban me-1"></i>Bloqué ({blockingFailed.length} point{blockingFailed.length > 1 ? 's' : ''})</>}
                    </span>
                )}
            </div>
            <div className="card-body">
                {showScore && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">Progression</small>
                            <small style={{ fontWeight: 600 }}>{passed}/{CHECKLIST_ITEMS.length} ({score}%)</small>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                            <div className="progress-bar" style={{ width: `${score}%`, backgroundColor: barColor, transition: 'width 0.3s' }} />
                        </div>
                    </div>
                )}

                <div className="list-group list-group-flush">
                    {CHECKLIST_ITEMS.map(item => {
                        const val = checklist[item.id];
                        const isChecked = val === 'checked';
                        const isNA = val === 'na';
                        return (
                            <div key={item.id} className="list-group-item d-flex align-items-center px-0 py-2" style={{ border: 'none', borderBottom: '1px solid #f0f0f0' }}>
                                <div className="form-check me-2" style={{ minWidth: 24 }}>
                                    <input type="checkbox" className="form-check-input"
                                        checked={isChecked} disabled={readOnly || isNA}
                                        onChange={() => handleCheck(item.id, isChecked ? null : 'checked')}
                                        style={{ cursor: readOnly ? 'default' : 'pointer' }} />
                                </div>
                                <span className={`flex-grow-1 ${isChecked || isNA ? 'text-muted' : ''}`}
                                    style={{ fontSize: '0.9rem', textDecoration: isChecked ? 'line-through' : 'none' }}>
                                    {item.id}. {item.label}
                                </span>
                                {item.blocking && !isChecked && !isNA && (
                                    <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '0.7rem' }}>Bloquant</span>
                                )}
                                {item.hasNA && !readOnly && (
                                    <button className={`btn btn-sm ms-1 ${isNA ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                        style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                                        onClick={() => handleCheck(item.id, isNA ? null : 'na')}>
                                        N/A
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { CHECKLIST_ITEMS };
export default PublicationChecklist;

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const TEMPLATE_EXPERT = 'first_name;last_name;email;phone;specialization;category;city;country;country_code;biography;years_experience';
const TEMPLATE_ORG = 'name;acronym;type;description;city;country;country_code;contact_email;contact_phone;website;address;region';

const AnnuaireImport = () => {
    const token = getToken();
    const fileInputRef = useRef(null);

    const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: importing, 4: results
    const [importType, setImportType] = useState('organization');
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState({ headers: [], rows: [] });
    const [columnMapping, setColumnMapping] = useState({});
    const [defaultStatus, setDefaultStatus] = useState('approved');
    const [toast, setToast] = useState(null);
    // importing state tracked by step (step 3 = importing)
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);

    const orgFields = [
        { key: 'name', label: 'Nom *', required: true },
        { key: 'acronym', label: 'Sigle' },
        { key: 'type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'city', label: 'Ville' },
        { key: 'country', label: 'Pays' },
        { key: 'country_code', label: 'Code pays' },
        { key: 'contact_email', label: 'Email' },
        { key: 'contact_phone', label: 'Téléphone' },
        { key: 'website', label: 'Site web' },
        { key: 'address', label: 'Adresse' },
        { key: 'region', label: 'Région' },
    ];

    const expertFields = [
        { key: 'first_name', label: 'Prénom *', required: true },
        { key: 'last_name', label: 'Nom *', required: true },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'specialization', label: 'Spécialisation' },
        { key: 'category', label: 'Catégorie' },
        { key: 'city', label: 'Ville' },
        { key: 'country', label: 'Pays' },
        { key: 'country_code', label: 'Code pays' },
        { key: 'biography', label: 'Biographie' },
        { key: 'years_experience', label: "Années d'expérience" },
    ];

    const fields = importType === 'organization' ? orgFields : expertFields;

    const parseCSV = (text) => {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return { headers: [], rows: [] };

        const delimiter = lines[0].includes(';') ? ';' : ',';

        const parseLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (ch === '"') {
                    inQuotes = !inQuotes;
                } else if (ch === delimiter && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += ch;
                }
            }
            result.push(current.trim());
            return result;
        };

        const headers = parseLine(lines[0]);
        const rows = lines.slice(1).map(line => parseLine(line));

        return { headers, rows };
    };

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        if (!selected.name.match(/\.(csv|xlsx?)$/i)) {
            setToast({ message: 'Seuls les fichiers CSV et Excel sont acceptés', type: 'error' });
            return;
        }

        setFile(selected);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            const parsed = parseCSV(text);
            setParsedData(parsed);

            // Auto-map columns
            const mapping = {};
            parsed.headers.forEach((header, idx) => {
                const normalized = header.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                const match = fields.find(f => {
                    const fNorm = f.key.toLowerCase();
                    return normalized === fNorm
                        || normalized.includes(fNorm)
                        || fNorm.includes(normalized)
                        // French aliases
                        || (fNorm === 'first_name' && (normalized === 'prenom' || normalized === 'pr_nom'))
                        || (fNorm === 'last_name' && (normalized === 'nom' || normalized === 'nom_famille'))
                        || (fNorm === 'name' && (normalized === 'nom' || normalized === 'organisation'))
                        || (fNorm === 'city' && normalized === 'ville')
                        || (fNorm === 'country' && normalized === 'pays')
                        || (fNorm === 'country_code' && normalized === 'code_pays')
                        || (fNorm === 'contact_phone' && (normalized === 'telephone' || normalized === 't_l_phone'))
                        || (fNorm === 'phone' && (normalized === 'telephone' || normalized === 't_l_phone'))
                        || (fNorm === 'contact_email' && normalized === 'email')
                        || (fNorm === 'website' && (normalized === 'site_web' || normalized === 'site'))
                        || (fNorm === 'address' && normalized === 'adresse')
                        || (fNorm === 'biography' && (normalized === 'biographie' || normalized === 'bio'))
                        || (fNorm === 'acronym' && normalized === 'sigle')
                        || (fNorm === 'specialization' && (normalized === 'specialisation' || normalized === 'specialite' || normalized === 'sp_cialisation'));
                });
                if (match) mapping[idx] = match.key;
            });
            setColumnMapping(mapping);
            setStep(2);
        };
        reader.readAsText(selected, 'UTF-8');
    };

    const handleImport = async () => {
        setStep(3);
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', importType === 'organization' ? 'organization' : 'expert');

        setProgress(30);

        const res = await api.upload('/mapping/admin/import', formData, token);

        setProgress(100);

        if (res.success) {
            setResults(res.data);
            setStep(4);
        } else {
            setToast({ message: res.message || 'Erreur lors de l\'import', type: 'error' });
            setStep(2);
        }
    };

    const downloadTemplate = (type) => {
        const template = type === 'organization' ? TEMPLATE_ORG : TEMPLATE_EXPERT;
        const blob = new Blob([template + '\n'], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `modele-${type}.csv`;
        link.click();
    };

    const resetImport = () => {
        setStep(1);
        setFile(null);
        setParsedData({ headers: [], rows: [] });
        setColumnMapping({});
        setResults(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            {/* Toast */}
            {toast && (
                <div
                    className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`}
                    style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}
                >
                    {toast.message}
                    <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item"><Link to="/annuaire">Annuaire</Link></li>
                            <li className="breadcrumb-item active">Importer</li>
                        </ol>
                    </nav>
                    <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        <i className="fas fa-file-import text-primary me-2"></i>
                        Importer des données
                    </h2>
                </div>
                <Link to="/annuaire" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-arrow-left me-1"></i> Retour
                </Link>
            </div>

            {/* Step indicator */}
            <div className="card mb-4">
                <div className="card-body py-3">
                    <div className="d-flex justify-content-between">
                        {['Upload', 'Aperçu', 'Import', 'Résultat'].map((label, idx) => (
                            <div key={idx} className="d-flex align-items-center" style={{ flex: 1 }}>
                                <div
                                    className={`d-flex align-items-center justify-content-center rounded-circle me-2 ${step > idx + 1 ? 'bg-success' : step === idx + 1 ? 'bg-primary' : 'bg-light'}`}
                                    style={{ width: 32, height: 32, color: step > idx ? '#fff' : '#aaa', fontSize: '14px', fontWeight: 600 }}
                                >
                                    {step > idx + 1 ? <i className="fas fa-check"></i> : idx + 1}
                                </div>
                                <span className={`small ${step === idx + 1 ? 'fw-semibold' : 'text-muted'}`}>{label}</span>
                                {idx < 3 && <div className="flex-grow-1 mx-2" style={{ height: 2, background: step > idx + 1 ? '#27ae60' : '#e0e0e0' }}></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <>
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0"><i className="fas fa-upload me-2"></i>Sélectionner un fichier</h5>
                                </div>
                                <div className="card-body">
                                    {/* Type selection */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Type de données à importer</label>
                                        <div className="d-flex gap-3">
                                            <div
                                                className={`card flex-fill ${importType === 'organization' ? 'border-primary' : ''}`}
                                                style={{ cursor: 'pointer', borderWidth: importType === 'organization' ? 2 : 1 }}
                                                onClick={() => setImportType('organization')}
                                            >
                                                <div className="card-body text-center py-3">
                                                    <i className={`fas fa-building fa-2x mb-2 ${importType === 'organization' ? 'text-primary' : 'text-muted'}`}></i>
                                                    <h6 className="mb-0">Organisations</h6>
                                                </div>
                                            </div>
                                            <div
                                                className={`card flex-fill ${importType === 'expert' ? 'border-primary' : ''}`}
                                                style={{ cursor: 'pointer', borderWidth: importType === 'expert' ? 2 : 1 }}
                                                onClick={() => setImportType('expert')}
                                            >
                                                <div className="card-body text-center py-3">
                                                    <i className={`fas fa-user-md fa-2x mb-2 ${importType === 'expert' ? 'text-primary' : 'text-muted'}`}></i>
                                                    <h6 className="mb-0">Experts</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File upload */}
                                    <div
                                        className="border-2 border-dashed rounded p-5 text-center"
                                        style={{
                                            borderStyle: 'dashed',
                                            borderColor: '#ccc',
                                            background: '#fafafa',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">Cliquez pour sélectionner un fichier</h5>
                                        <p className="text-muted small mb-0">Formats acceptés : CSV, Excel (.csv, .xlsx, .xls)</p>
                                        <p className="text-muted small">Taille maximale : 10 Mo</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="d-none"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            {/* Download templates */}
                            <div className="card mb-4">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0"><i className="fas fa-download me-2"></i>Modèles</h5>
                                </div>
                                <div className="card-body d-grid gap-2">
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => downloadTemplate('organization')}>
                                        <i className="fas fa-building me-1"></i> Modèle Organisations (.csv)
                                    </button>
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => downloadTemplate('expert')}>
                                        <i className="fas fa-user-md me-1"></i> Modèle Experts (.csv)
                                    </button>
                                </div>
                            </div>

                            {/* Expected columns */}
                            <div className="card">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0"><i className="fas fa-columns me-2"></i>Colonnes attendues</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="list-group list-group-flush">
                                        {fields.map(f => (
                                            <div key={f.key} className="list-group-item py-2 d-flex justify-content-between">
                                                <span className="small">{f.label}</span>
                                                <code className="small">{f.key}</code>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
                <div className="card">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="fas fa-table me-2"></i>
                            Aperçu des données ({parsedData.rows.length} lignes)
                        </h5>
                        <div className="d-flex gap-2">
                            <span className="badge bg-light text-dark">
                                <i className="fas fa-file me-1"></i>{file?.name}
                            </span>
                        </div>
                    </div>
                    <div className="card-body">
                        {/* Column mapping */}
                        <div className="alert alert-info py-2 mb-3">
                            <i className="fas fa-info-circle me-1"></i>
                            Vérifiez que le mapping des colonnes est correct. Modifiez si nécessaire.
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold small">Mapping des colonnes</label>
                            <div className="row g-2">
                                {parsedData.headers.map((header, idx) => (
                                    <div key={idx} className="col-md-4 col-lg-3">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text text-truncate" style={{ maxWidth: 120, fontSize: '12px' }} title={header}>
                                                {header}
                                            </span>
                                            <select
                                                className="form-select form-select-sm"
                                                value={columnMapping[idx] || ''}
                                                onChange={(e) => setColumnMapping(prev => ({ ...prev, [idx]: e.target.value }))}
                                            >
                                                <option value="">-- Ignorer --</option>
                                                {fields.map(f => (
                                                    <option key={f.key} value={f.key}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Default options */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Statut par défaut</label>
                                <select className="form-select form-select-sm" value={defaultStatus} onChange={(e) => setDefaultStatus(e.target.value)}>
                                    <option value="approved">Approuvé (publié)</option>
                                    <option value="draft">Brouillon</option>
                                    <option value="pending">En attente</option>
                                </select>
                            </div>
                        </div>

                        {/* Data preview table */}
                        <div className="table-responsive" style={{ maxHeight: 400 }}>
                            <table className="table table-sm table-bordered table-striped mb-0" style={{ fontSize: '12px' }}>
                                <thead className="bg-light sticky-top">
                                    <tr>
                                        <th>#</th>
                                        {parsedData.headers.map((h, i) => (
                                            <th key={i} className={columnMapping[i] ? 'text-primary' : 'text-muted'}>
                                                {columnMapping[i] ? (
                                                    <><i className="fas fa-link me-1"></i>{h}</>
                                                ) : (
                                                    <><i className="fas fa-ban me-1"></i>{h}</>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.rows.slice(0, 20).map((row, i) => (
                                        <tr key={i}>
                                            <td className="text-muted">{i + 1}</td>
                                            {row.map((cell, j) => (
                                                <td key={j} className={!columnMapping[j] ? 'text-muted' : ''}>
                                                    {cell || <span className="text-muted">-</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {parsedData.rows.length > 20 && (
                            <p className="text-muted small mt-2">
                                Affichage des 20 premières lignes sur {parsedData.rows.length}
                            </p>
                        )}
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                        <button className="btn btn-outline-secondary" onClick={resetImport}>
                            <i className="fas fa-arrow-left me-1"></i> Retour
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleImport}
                            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}
                        >
                            <i className="fas fa-upload me-1"></i> Lancer l'import ({parsedData.rows.length} lignes)
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Importing */}
            {step === 3 && (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: 48, height: 48 }}>
                            <span className="visually-hidden">Import en cours...</span>
                        </div>
                        <h4>Import en cours...</h4>
                        <p className="text-muted">Veuillez patienter, cela peut prendre quelques instants.</p>
                        <div className="progress mx-auto" style={{ maxWidth: 400, height: 10 }}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated"
                                style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Results */}
            {step === 4 && results && (
                <div className="card">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">
                            <i className="fas fa-chart-bar text-success me-2"></i>
                            Résultat de l'import
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <div className="card bg-light text-center">
                                    <div className="card-body py-3">
                                        <h3 className="mb-0 text-primary" style={{ fontWeight: 800 }}>{results.total}</h3>
                                        <small className="text-muted">Total lignes</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center" style={{ background: '#27ae6015' }}>
                                    <div className="card-body py-3">
                                        <h3 className="mb-0" style={{ color: '#27ae60', fontWeight: 800 }}>{results.imported}</h3>
                                        <small className="text-muted">Importés</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center" style={{ background: '#e74c3c15' }}>
                                    <div className="card-body py-3">
                                        <h3 className="mb-0" style={{ color: '#e74c3c', fontWeight: 800 }}>{results.skipped}</h3>
                                        <small className="text-muted">Ignorés / Erreurs</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center" style={{ background: '#f39c1215' }}>
                                    <div className="card-body py-3">
                                        <h3 className="mb-0" style={{ color: '#f39c12', fontWeight: 800 }}>
                                            {results.imported > 0 ? Math.round((results.imported / results.total) * 100) : 0}%
                                        </h3>
                                        <small className="text-muted">Taux de succès</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error details */}
                        {results.errors && results.errors.length > 0 && (
                            <div className="mb-4">
                                <h6 className="text-danger">
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    Erreurs ({results.errors.length})
                                </h6>
                                <div className="bg-light rounded p-3" style={{ maxHeight: 250, overflowY: 'auto', fontSize: '13px' }}>
                                    {results.errors.map((err, i) => (
                                        <div key={i} className="text-danger mb-1">
                                            <i className="fas fa-times me-1"></i> {err}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary" onClick={resetImport}>
                                <i className="fas fa-redo me-1"></i> Nouvel import
                            </button>
                            <Link to="/annuaire/list" className="btn btn-primary"
                                  style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                                <i className="fas fa-list me-1"></i> Voir la liste
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AnnuaireImport;

import React, { useState, useEffect } from 'react';

const PRESETS = [
    { label: 'Facebook', source: 'facebook', medium: 'social' },
    { label: 'X / Twitter', source: 'twitter', medium: 'social' },
    { label: 'WhatsApp', source: 'whatsapp', medium: 'social' },
    { label: 'LinkedIn', source: 'linkedin', medium: 'social' },
    { label: 'Newsletter', source: 'newsletter', medium: 'email' },
    { label: 'Partenaire', source: 'partner', medium: 'referral' },
];

const UTMGenerator = () => {
    const [form, setForm] = useState({ url: 'https://www.africavet.com/', source: '', medium: '', campaign: '', content: '' });
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        try { setHistory(JSON.parse(localStorage.getItem('utm_history') || '[]')); } catch { }
    }, []);

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const applyPreset = (preset) => {
        setForm(prev => ({ ...prev, source: preset.source, medium: preset.medium }));
    };

    const generatedUrl = () => {
        if (!form.url || !form.source) return '';
        const params = new URLSearchParams();
        if (form.source) params.set('utm_source', form.source);
        if (form.medium) params.set('utm_medium', form.medium);
        if (form.campaign) params.set('utm_campaign', form.campaign);
        if (form.content) params.set('utm_content', form.content);
        const sep = form.url.includes('?') ? '&' : '?';
        return `${form.url}${sep}${params.toString()}`;
    };

    const handleCopy = () => {
        const url = generatedUrl();
        if (!url) return;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        const newHistory = [{ url, date: new Date().toISOString(), source: form.source }, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('utm_history', JSON.stringify(newHistory));
    };

    const url = generatedUrl();

    return (
        <div className="row">
            <div className="col-12 mb-4">
                <h4><i className="fas fa-link me-2" style={{ color: '#354e84' }}></i>Générateur de liens UTM</h4>
            </div>

            <div className="col-md-7">
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-cog me-2 text-primary"></i>Paramètres</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">URL de base <span className="text-danger">*</span></label>
                            <input type="url" className="form-control" value={form.url}
                                onChange={e => handleChange('url', e.target.value)} placeholder="https://www.africavet.com/article/..." />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Presets rapides</label>
                            <div className="d-flex flex-wrap gap-2">
                                {PRESETS.map(p => (
                                    <button key={p.label} className={`btn btn-sm ${form.source === p.source ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => applyPreset(p)} style={{ borderRadius: 20 }}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Source <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" value={form.source}
                                    onChange={e => handleChange('source', e.target.value)} placeholder="facebook, newsletter..." />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Medium</label>
                                <select className="form-select" value={form.medium} onChange={e => handleChange('medium', e.target.value)}>
                                    <option value="">— Choisir —</option>
                                    <option value="social">social</option>
                                    <option value="email">email</option>
                                    <option value="referral">referral</option>
                                    <option value="cpc">cpc</option>
                                    <option value="display">display</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Campagne</label>
                                <input type="text" className="form-control" value={form.campaign}
                                    onChange={e => handleChange('campaign', e.target.value)} placeholder="lancement-serie-55-pays" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Contenu (optionnel)</label>
                                <input type="text" className="form-control" value={form.content}
                                    onChange={e => handleChange('content', e.target.value)} placeholder="bouton-cta, image-hero..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                        <h5 className="mb-0"><i className="fas fa-eye me-2 text-primary"></i>URL générée</h5>
                    </div>
                    <div className="card-body">
                        {url ? (
                            <>
                                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 12, wordBreak: 'break-all', fontSize: '0.85rem', fontFamily: 'monospace', border: '1px solid #e9ecef' }}>
                                    {url}
                                </div>
                                <button className={`btn mt-3 text-white ${copied ? 'btn-success' : ''}`} onClick={handleCopy}
                                    style={copied ? {} : { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' }}>
                                    <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} me-1`}></i>
                                    {copied ? 'Copié !' : 'Copier le lien'}
                                </button>
                            </>
                        ) : (
                            <p className="text-muted mb-0">Remplissez au moins l'URL et la source pour générer un lien.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="col-md-5">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 d-flex justify-content-between">
                        <h5 className="mb-0"><i className="fas fa-history me-2 text-primary"></i>Historique</h5>
                        {history.length > 0 && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => { setHistory([]); localStorage.removeItem('utm_history'); }}>
                                Vider
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        {history.length === 0 ? (
                            <p className="text-muted text-center">Aucun lien généré</p>
                        ) : (
                            <div className="list-group list-group-flush">
                                {history.map((item, i) => (
                                    <div key={i} className="list-group-item px-0 py-2">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <small className="text-muted">{new Date(item.date).toLocaleDateString('fr-FR')} — {item.source}</small>
                                                <div style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: '#354e84' }}>{item.url}</div>
                                            </div>
                                            <button className="btn btn-sm btn-outline-primary ms-2" style={{ flexShrink: 0 }}
                                                onClick={() => { navigator.clipboard.writeText(item.url); }}>
                                                <i className="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UTMGenerator;

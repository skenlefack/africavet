import React, { useState, useRef, useEffect } from 'react';

const AFRICAN_COUNTRIES = [
    { code2: 'DZ', code3: 'DZA', nom_fr: 'Algérie' }, { code2: 'AO', code3: 'AGO', nom_fr: 'Angola' },
    { code2: 'BJ', code3: 'BEN', nom_fr: 'Bénin' }, { code2: 'BW', code3: 'BWA', nom_fr: 'Botswana' },
    { code2: 'BF', code3: 'BFA', nom_fr: 'Burkina Faso' }, { code2: 'BI', code3: 'BDI', nom_fr: 'Burundi' },
    { code2: 'CV', code3: 'CPV', nom_fr: 'Cap-Vert' }, { code2: 'CM', code3: 'CMR', nom_fr: 'Cameroun' },
    { code2: 'CF', code3: 'CAF', nom_fr: 'Centrafrique' }, { code2: 'TD', code3: 'TCD', nom_fr: 'Tchad' },
    { code2: 'KM', code3: 'COM', nom_fr: 'Comores' }, { code2: 'CG', code3: 'COG', nom_fr: 'Congo' },
    { code2: 'CD', code3: 'COD', nom_fr: 'RD Congo' }, { code2: 'CI', code3: 'CIV', nom_fr: "Côte d'Ivoire" },
    { code2: 'DJ', code3: 'DJI', nom_fr: 'Djibouti' }, { code2: 'EG', code3: 'EGY', nom_fr: 'Égypte' },
    { code2: 'GQ', code3: 'GNQ', nom_fr: 'Guinée équatoriale' }, { code2: 'ER', code3: 'ERI', nom_fr: 'Érythrée' },
    { code2: 'SZ', code3: 'SWZ', nom_fr: 'Eswatini' }, { code2: 'ET', code3: 'ETH', nom_fr: 'Éthiopie' },
    { code2: 'GA', code3: 'GAB', nom_fr: 'Gabon' }, { code2: 'GM', code3: 'GMB', nom_fr: 'Gambie' },
    { code2: 'GH', code3: 'GHA', nom_fr: 'Ghana' }, { code2: 'GN', code3: 'GIN', nom_fr: 'Guinée' },
    { code2: 'GW', code3: 'GNB', nom_fr: 'Guinée-Bissau' }, { code2: 'KE', code3: 'KEN', nom_fr: 'Kenya' },
    { code2: 'LS', code3: 'LSO', nom_fr: 'Lesotho' }, { code2: 'LR', code3: 'LBR', nom_fr: 'Liberia' },
    { code2: 'LY', code3: 'LBY', nom_fr: 'Libye' }, { code2: 'MG', code3: 'MDG', nom_fr: 'Madagascar' },
    { code2: 'MW', code3: 'MWI', nom_fr: 'Malawi' }, { code2: 'ML', code3: 'MLI', nom_fr: 'Mali' },
    { code2: 'MR', code3: 'MRT', nom_fr: 'Mauritanie' }, { code2: 'MU', code3: 'MUS', nom_fr: 'Maurice' },
    { code2: 'MA', code3: 'MAR', nom_fr: 'Maroc' }, { code2: 'MZ', code3: 'MOZ', nom_fr: 'Mozambique' },
    { code2: 'NA', code3: 'NAM', nom_fr: 'Namibie' }, { code2: 'NE', code3: 'NER', nom_fr: 'Niger' },
    { code2: 'NG', code3: 'NGA', nom_fr: 'Nigeria' }, { code2: 'RW', code3: 'RWA', nom_fr: 'Rwanda' },
    { code2: 'ST', code3: 'STP', nom_fr: 'São Tomé-et-Príncipe' }, { code2: 'SN', code3: 'SEN', nom_fr: 'Sénégal' },
    { code2: 'SC', code3: 'SYC', nom_fr: 'Seychelles' }, { code2: 'SL', code3: 'SLE', nom_fr: 'Sierra Leone' },
    { code2: 'SO', code3: 'SOM', nom_fr: 'Somalie' }, { code2: 'ZA', code3: 'ZAF', nom_fr: 'Afrique du Sud' },
    { code2: 'SS', code3: 'SSD', nom_fr: 'Soudan du Sud' }, { code2: 'SD', code3: 'SDN', nom_fr: 'Soudan' },
    { code2: 'TZ', code3: 'TZA', nom_fr: 'Tanzanie' }, { code2: 'TG', code3: 'TGO', nom_fr: 'Togo' },
    { code2: 'TN', code3: 'TUN', nom_fr: 'Tunisie' }, { code2: 'UG', code3: 'UGA', nom_fr: 'Ouganda' },
    { code2: 'ZM', code3: 'ZMB', nom_fr: 'Zambie' }, { code2: 'ZW', code3: 'ZWE', nom_fr: 'Zimbabwe' },
];

const AfricanCountrySelect = ({ value, onChange, hasError, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filtered = search
        ? AFRICAN_COUNTRIES.filter(c => normalize(c.nom_fr).includes(normalize(search)))
        : AFRICAN_COUNTRIES;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    const select = (country) => {
        onChange(country.nom_fr, country.code3);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`form-select text-start ${hasError ? 'is-invalid' : ''}`}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', color: value ? undefined : '#6c757d' }}
            >
                {value || 'Sélectionner un pays...'}
            </button>

            {isOpen && (
                <div className="border rounded shadow-sm bg-white" style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    zIndex: 1050, overflow: 'hidden'
                }}>
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0' }}>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white"><i className="fas fa-search text-muted"></i></span>
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-control"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un pays..."
                            />
                            {search && (
                                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                        {filtered.length > 0 ? filtered.map((c) => (
                            <button
                                key={c.code2}
                                type="button"
                                onClick={() => select(c)}
                                className={`dropdown-item d-flex align-items-center ${c.nom_fr === value ? 'active' : ''}`}
                                style={{ padding: '8px 16px' }}
                            >
                                {c.nom_fr === value && <i className="fas fa-check me-2" style={{ fontSize: '11px' }}></i>}
                                {c.nom_fr}
                                <small className="ms-auto text-muted">{c.code3}</small>
                            </button>
                        )) : (
                            <div className="text-center text-muted py-3" style={{ fontSize: '0.9rem' }}>
                                Aucun pays trouvé
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export { AFRICAN_COUNTRIES };
export default AfricanCountrySelect;

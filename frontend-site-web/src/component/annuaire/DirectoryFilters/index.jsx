import React from 'react';
import FontAwesome from '../../uiStyle/FontAwesome';

const SPECIALITIES = [
  'Veterinaire',
  'Zootechnicien',
  'Parasitologue',
  'Epidemiologiste',
  'Nutritionniste animal',
  'Chirurgien veterinaire',
  'Pathologiste',
  'Pharmacologue',
  'Biologiste',
  'Agronome',
];

const COUNTRIES = [
  'Senegal',
  'Cote d\'Ivoire',
  'Cameroun',
  'Mali',
  'Burkina Faso',
  'Guinee',
  'Benin',
  'Togo',
  'Niger',
  'RD Congo',
  'Madagascar',
  'Gabon',
  'Tchad',
  'Maroc',
  'Tunisie',
  'Algerie',
];

const ORGANIZATION_TYPES = [
  'Clinique veterinaire',
  'Laboratoire',
  'ONG',
  'Universite',
  'Centre de recherche',
  'Association professionnelle',
  'Industrie pharmaceutique',
  'Fournisseur',
  'Institution gouvernementale',
];

const DirectoryFilters = ({ filters, onFilterChange, onClearFilters, activeTab }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.speciality || filters.country || filters.organization_type;

  return (
    <div
      className="card border-0 shadow-sm mb-4"
      style={{ borderRadius: '12px', position: 'sticky', top: '20px' }}
    >
      <div
        className="card-header border-0 d-flex align-items-center justify-content-between"
        style={{
          background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
          borderRadius: '12px 12px 0 0',
          padding: '16px 20px',
        }}
      >
        <h6 className="mb-0 text-white" style={{ fontWeight: '700', fontSize: '15px' }}>
          <FontAwesome name="filter" style={{ marginRight: '8px' }} />
          Filtres
        </h6>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-sm"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: 'none',
              fontSize: '12px',
              borderRadius: '6px',
              padding: '4px 10px',
            }}
          >
            <FontAwesome name="times" /> Effacer
          </button>
        )}
      </div>

      <div className="card-body" style={{ padding: '20px' }}>
        {/* Speciality filter (shown for experts tab or all) */}
        {(activeTab === 'experts' || activeTab === 'all') && (
          <div className="mb-4">
            <label
              className="d-block mb-2"
              style={{ fontSize: '13px', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              <FontAwesome name="stethoscope" style={{ marginRight: '6px', color: '#7ac142' }} />
              Specialite
            </label>
            <select
              className="form-control form-control-sm"
              value={filters.speciality || ''}
              onChange={(e) => handleChange('speciality', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="">Toutes les specialites</option>
              {SPECIALITIES.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Country filter */}
        <div className="mb-4">
          <label
            className="d-block mb-2"
            style={{ fontSize: '13px', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            <FontAwesome name="globe" style={{ marginRight: '6px', color: '#7ac142' }} />
            Pays
          </label>
          <select
            className="form-control form-control-sm"
            value={filters.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            style={{ borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', padding: '8px 12px' }}
          >
            <option value="">Tous les pays</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Organization type filter (shown for organizations tab or all) */}
        {(activeTab === 'organisations' || activeTab === 'all') && (
          <div className="mb-4">
            <label
              className="d-block mb-2"
              style={{ fontSize: '13px', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              <FontAwesome name="building" style={{ marginRight: '6px', color: '#7ac142' }} />
              Type d'organisation
            </label>
            <select
              className="form-control form-control-sm"
              value={filters.organization_type || ''}
              onChange={(e) => handleChange('organization_type', e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="">Tous les types</option>
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Summary */}
        {hasActiveFilters && (
          <div
            className="p-3"
            style={{ background: '#f8f9fa', borderRadius: '8px', fontSize: '12px', color: '#666' }}
          >
            <FontAwesome name="info-circle" style={{ marginRight: '6px', color: '#354e84' }} />
            Filtres actifs :
            <div className="d-flex flex-wrap gap-1 mt-2">
              {filters.speciality && (
                <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>
                  {filters.speciality}
                  <button
                    onClick={() => handleChange('speciality', '')}
                    style={{ background: 'none', border: 'none', color: '#2e7d32', padding: '0 0 0 4px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    <FontAwesome name="times" />
                  </button>
                </span>
              )}
              {filters.country && (
                <span className="badge" style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>
                  {filters.country}
                  <button
                    onClick={() => handleChange('country', '')}
                    style={{ background: 'none', border: 'none', color: '#1565c0', padding: '0 0 0 4px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    <FontAwesome name="times" />
                  </button>
                </span>
              )}
              {filters.organization_type && (
                <span className="badge" style={{ background: '#fff3e0', color: '#e65100', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}>
                  {filters.organization_type}
                  <button
                    onClick={() => handleChange('organization_type', '')}
                    style={{ background: 'none', border: 'none', color: '#e65100', padding: '0 0 0 4px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    <FontAwesome name="times" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryFilters;

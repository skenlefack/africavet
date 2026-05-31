import React, { useState, useEffect } from 'react';
import FontAwesome from '../uiStyle/FontAwesome';
import { documentsApi } from '../../services/api';

const FILE_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'doc,docx', label: 'Word' },
  { value: 'xls,xlsx', label: 'Excel' },
  { value: 'ppt,pptx', label: 'PowerPoint' },
  { value: 'zip,rar', label: 'Archives' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus recents' },
  { value: 'popular', label: 'Plus telecharges' },
  { value: 'title', label: 'Titre A-Z' },
  { value: 'oldest', label: 'Plus anciens' },
];

const DocumentFilters = ({
  onFilterChange,
  initialSearch = '',
  initialType = '',
  initialCountry = '',
  initialYear = '',
  initialSort = 'recent',
  showSearch = true,
  compact = false,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [country, setCountry] = useState(initialCountry);
  const [year, setYear] = useState(initialYear);
  const [sort, setSort] = useState(initialSort);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    documentsApi.getCountries().then(res => {
      if (res.success && res.data) setCountries(res.data);
    });
  }, []);

  // Generate year options (current year down to 2000)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2000; y--) years.push(y);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    emitChange({ search });
  };

  const emitChange = (overrides = {}) => {
    const filters = { search, type, country, year, sort, ...overrides };
    onFilterChange(filters);
  };

  const handleTypeChange = (val) => {
    setType(val);
    emitChange({ type: val });
  };

  const handleCountryChange = (val) => {
    setCountry(val);
    emitChange({ country: val });
  };

  const handleYearChange = (val) => {
    setYear(val);
    emitChange({ year: val });
  };

  const handleSortChange = (val) => {
    setSort(val);
    emitChange({ sort: val });
  };

  const handleReset = () => {
    setSearch('');
    setType('');
    setCountry('');
    setYear('');
    setSort('recent');
    onFilterChange({ search: '', type: '', country: '', year: '', sort: 'recent' });
  };

  const hasFilters = search || type || country || year || sort !== 'recent';

  if (compact) {
    return (
      <div className="d-flex flex-wrap" style={{ gap: '10px' }}>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '140px' }}
          value={type}
          onChange={e => handleTypeChange(e.target.value)}
        >
          {FILE_TYPES.map(ft => (
            <option key={ft.value} value={ft.value}>{ft.label}</option>
          ))}
        </select>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '140px' }}
          value={sort}
          onChange={e => handleSortChange(e.target.value)}
        >
          {SORT_OPTIONS.map(so => (
            <option key={so.value} value={so.value}>{so.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', padding: '20px' }}>
      {/* Search bar */}
      {showSearch && (
        <form onSubmit={handleSearchSubmit} style={{ marginBottom: '16px' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un document..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: '8px 0 0 8px' }}
            />
            <div className="input-group-append">
              <button type="submit" className="btn btn-primary" style={{ borderRadius: '0 8px 8px 0' }}>
                <FontAwesome name="search" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter selects */}
      <div className="row" style={{ gap: '0' }}>
        <div className="col-md-3 mb-2">
          <select
            className="form-control"
            value={type}
            onChange={e => handleTypeChange(e.target.value)}
          >
            {FILE_TYPES.map(ft => (
              <option key={ft.value} value={ft.value}>{ft.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-control"
            value={country}
            onChange={e => handleCountryChange(e.target.value)}
          >
            <option value="">Tous les pays</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <select
            className="form-control"
            value={year}
            onChange={e => handleYearChange(e.target.value)}
          >
            <option value="">Toutes les annees</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 mb-2">
          <select
            className="form-control"
            value={sort}
            onChange={e => handleSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map(so => (
              <option key={so.value} value={so.value}>{so.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 mb-2">
          {hasFilters && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-block"
              onClick={handleReset}
            >
              <FontAwesome name="times" /> Reinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentFilters;

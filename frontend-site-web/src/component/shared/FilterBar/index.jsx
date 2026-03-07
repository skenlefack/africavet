import React from 'react';

const FilterBar = ({ filters = [], activeFilter, onFilterChange, searchValue, onSearchChange, searchPlaceholder = 'Rechercher...' }) => {
  return (
    <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
      {filters.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`btn btn-sm ${activeFilter === filter.value ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={activeFilter === filter.value ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
            >
              {filter.label}
              {filter.count !== undefined && <span className="ms-1">({filter.count})</span>}
            </button>
          ))}
        </div>
      )}
      {onSearchChange && (
        <div className="ms-auto" style={{ minWidth: '250px' }}>
          <input
            type="text"
            className="form-control"
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default FilterBar;

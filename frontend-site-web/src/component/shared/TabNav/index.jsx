import React from 'react';

const TabNav = ({ tabs, activeTab, onTabChange }) => {
  return (
    <ul className="nav nav-tabs mb-4">
      {tabs.map(tab => (
        <li className="nav-item" key={tab.value}>
          <button
            className={`nav-link ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => onTabChange(tab.value)}
            style={activeTab === tab.value ? { color: '#354e84', borderBottomColor: '#354e84', fontWeight: '600' } : { cursor: 'pointer' }}
          >
            {tab.icon && <span className="me-2"><i className={tab.icon}></i></span>}
            {tab.label}
            {tab.count !== undefined && <span className="badge bg-secondary ms-2">{tab.count}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TabNav;

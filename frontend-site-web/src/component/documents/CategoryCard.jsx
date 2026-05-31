import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from '../uiStyle/FontAwesome';

const CategoryCard = ({ category }) => {
  const color = category.color || '#354e84';
  const icon = category.icon || 'folder-open-o';
  const count = category.document_count || 0;

  return (
    <Link
      to={`/bibliotheque/categorie/${category.slug}`}
      className="category-card-link"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="doc-category-card"
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px 20px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          border: '1px solid #eee',
          height: '100%',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
          }}
        >
          <FontAwesome name={icon} />
          <style>{`.doc-category-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important; }`}</style>
        </div>
        <h6 style={{ fontWeight: '600', color: '#333', marginBottom: '6px', fontSize: '15px' }}>
          {category.name_fr || category.name}
        </h6>
        <span style={{ fontSize: '13px', color: '#999' }}>
          {count} document{count !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;

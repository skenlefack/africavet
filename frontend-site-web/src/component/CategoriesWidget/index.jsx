import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import FontAwesome from "../uiStyle/FontAwesome";
import "./style.scss";

// Icônes FontAwesome 4 et couleurs par défaut pour chaque catégorie
const categoryDefaults = {
  'elevage': { icon: 'leaf', color: '#8B4513' },
  'peches': { icon: 'anchor', color: '#1E90FF' },
  'faune': { icon: 'paw', color: '#228B22' },
  'one-health': { icon: 'globe', color: '#00AB6C' },
  'sante-animale': { icon: 'heartbeat', color: '#9B59B6' },
  'antibioresistance': { icon: 'flask', color: '#E74C3C' },
  'news': { icon: 'newspaper-o', color: '#1091FF' },
  'actualites': { icon: 'newspaper-o', color: '#1091FF' },
  'zoonoses': { icon: 'bug', color: '#C0392B' },
  'publications': { icon: 'book', color: '#2ECC71' },
  'securite-sanitaire': { icon: 'shield', color: '#3498DB' },
  'opportunites': { icon: 'briefcase', color: '#8B5CF6' },
  'veterinaires': { icon: 'user-md', color: '#E67E22' },
  'videos': { icon: 'video-camera', color: '#E91E63' },
  'covid-19': { icon: 'warning', color: '#FF5722' },
  'mpox': { icon: 'exclamation-triangle', color: '#FF9800' },
  'rage': { icon: 'medkit', color: '#F44336' },
  'article': { icon: 'file-text-o', color: '#607D8B' },
  'analysis': { icon: 'line-chart', color: '#00BCD4' },
  'interview': { icon: 'microphone', color: '#9C27B0' },
  'event': { icon: 'calendar', color: '#4CAF50' },
};

const CategoriesWidget = () => {
  const { categories, loading } = useApp();

  // Filtrer les catégories avec des articles
  const activeCategories = categories.filter(c => c.post_count > 0).slice(0, 8);

  // Obtenir l'icône et la couleur pour une catégorie (utilise les défauts FA4 compatibles)
  const getCategoryStyle = (cat) => {
    const defaults = categoryDefaults[cat.slug] || { icon: 'folder-o', color: '#1091FF' };
    // Toujours utiliser les icônes par défaut car la DB contient des icônes FA5/FA6
    return {
      icon: defaults.icon,
      color: cat.color || defaults.color
    };
  };

  if (loading) {
    return (
      <div className="categories-widget">
        <div className="categories-widget-header">
          <h3 className="categories-widget-title">
            <FontAwesome name="th-large" /> Catégories
          </h3>
        </div>
        <div className="categories-loading">
          <div className="spinner"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-widget">
      <div className="categories-widget-header">
        <h3 className="categories-widget-title">
          <FontAwesome name="th-large" /> Catégories
        </h3>
        <Link to="/categories" className="categories-see-all">
          Voir tout <FontAwesome name="angle-right" />
        </Link>
      </div>

      <div className="categories-grid">
        {activeCategories.map((cat) => {
          const style = getCategoryStyle(cat);
          return (
            <Link
              key={cat.id}
              to={`/categorie/${cat.slug}`}
              className="category-item"
              style={{ '--category-color': style.color }}
            >
              <div className="category-icon-wrapper">
                <FontAwesome name={style.icon} />
              </div>
              <div className="category-info">
                <span className="category-name">{cat.name_fr || cat.name}</span>
                <span className="category-count">{cat.post_count} article{cat.post_count > 1 ? 's' : ''}</span>
              </div>
              <div className="category-arrow">
                <FontAwesome name="chevron-right" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesWidget;

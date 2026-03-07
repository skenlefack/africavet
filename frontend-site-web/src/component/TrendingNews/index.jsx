import React from "react";
import ProtoTypes from "prop-types";
import Heading from "../uiStyle/Heading";
import TrendingNewsSlider from "../TrendingNewsSlider";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import { useData } from "../../context/DataContext";
import { useApp } from "../../context/AppContext";

// Images par défaut
import transm1 from "../../assets/img/gallery-1.jpg";
import transm2 from "../../assets/img/gallery-2.jpg";
import transm3 from "../../assets/img/gallery-3.jpg";

const defaultNews = [
  { id: 1, image: transm1, category: "Actualités", categorySlug: "news", date: "13 février 2026", title: "Les dernières avancées en médecine vétérinaire en Afrique de l'Ouest", slug: "#" },
  { id: 2, image: transm2, category: "Santé Animale", categorySlug: "sante-animale", date: "12 février 2026", title: "Prévention des zoonoses : les nouvelles recommandations de l'OIE", slug: "#" },
  { id: 3, image: transm3, category: "One Health", categorySlug: "one-health", date: "11 février 2026", title: "L'approche One Health gagne du terrain en Afrique centrale", slug: "#" },
  { id: 4, image: transm1, category: "Élevage", categorySlug: "elevage", date: "10 février 2026", title: "Amélioration génétique des races bovines locales au Sahel", slug: "#" },
  { id: 5, image: transm2, category: "Formation", categorySlug: "formations", date: "9 février 2026", title: "Nouveau programme de formation continue pour vétérinaires", slug: "#" },
  { id: 6, image: transm3, category: "Opportunités", categorySlug: "opportunites", date: "8 février 2026", title: "Offres d'emploi : recrutement massif dans le secteur vétérinaire", slug: "#" },
];

const TrendingNews = ({ dark }) => {
  const { trendingPosts, loading } = useData();
  const { getCategoryColor } = useApp();

  // Utiliser les données API ou fallback - s'assurer d'avoir au moins 6 articles
  const apiData = trendingPosts.length > 0 ? trendingPosts : [];
  const trendingNews = apiData.length >= 6 ? apiData : [...apiData, ...defaultNews].slice(0, 6);

  // Composant pour un article trending - image en haut, texte en bas
  const TrendingItem = ({ item, index }) => (
    <div className="trending-card">
      <div className="trending-card-image">
        <Link to={`/article/${item.slug}`}>
          <img src={item.image} alt={item.title} />
        </Link>
        <span className="trending-badge">
          <FontAwesome name="bolt" />
        </span>
        <Link to={`/categorie/${item.categorySlug || 'news'}`} className="trending-card-category" style={{ backgroundColor: getCategoryColor(item.categorySlug || 'news') }}>
          {item.category}
        </Link>
      </div>
      <div className="trending-card-content">
        <h4 className="trending-card-title">
          <Link to={`/article/${item.slug}`}>{item.title}</Link>
        </h4>
        <span className="trending-card-date">
          <FontAwesome name="clock-o" /> {item.date}
        </span>
      </div>
    </div>
  );

  return (
    <div className="trending-section">
      <Heading title="Tendances" />
      <TrendingNewsSlider />
      {dark ? (
        <div className="border_white" />
      ) : (
        <div className="border_black" />
      )}
      <div className="space-30" />

      {/* Grille des articles trending - 2 colonnes, image en haut */}
      <div className="trending-cards-grid">
        {trendingNews.map((item, i) => (
          <TrendingItem key={item.id || `trend-${i}`} item={item} index={i} />
        ))}
      </div>
    </div>
  );
};

export default TrendingNews;

TrendingNews.propTypes = {
  dark: ProtoTypes.bool,
};

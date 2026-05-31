import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import FontAwesome from "../uiStyle/FontAwesome";
import Slider from "../Slider";
import { postsApi, getImageUrl as resolveImageUrl } from "../../services/api";
import { useApp } from "../../context/AppContext";
import "./style.scss";

// Image par défaut
import defaultImg from "../../assets/img/post-1.jpg";

// Convertir hex en rgba
const hexToRgba = (hex, alpha = 0.7) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CategorySection = ({
  categorySlug,
  categoryName,
  categoryIcon,
  layout = "grid", // grid, carousel, list, featured
  limit = 4,
  showSeeAll = true,
  dark = false,
  className = ""
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCategoryColor } = useApp();

  // Style pour le gradient avec la couleur de catégorie (0.9 pour assombrir et améliorer lisibilité du texte blanc)
  const getGradientStyle = () => ({
    '--category-gradient-color': hexToRgba(getCategoryColor(categorySlug), 0.9)
  });

  useEffect(() => {
    loadPosts();
  }, [categorySlug]);

  const loadPosts = async () => {
    try {
      const response = await postsApi.getByCategory(categorySlug, 1, limit);
      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading category posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => resolveImageUrl(path, defaultImg);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) return null;
  if (posts.length === 0) return null;

  // Layout: Cards (2 colonnes, image en haut, texte en bas - comme Tendances)
  if (layout === "cards") {
    return (
      <div className={`category_section cards_section ${className} ${dark ? 'dark_bg' : ''}`}>
        <div className="row">
          <div className="col-6 align-self-center">
            <h2 className="widget-title">
              {categoryIcon && <FontAwesome name={categoryIcon} />} {categoryName}
            </h2>
          </div>
          {showSeeAll && (
            <div className="col-6 text-right align-self-center">
              <Link to={`/categorie/${categorySlug}`} className="see_all mb20">
                Voir tout
              </Link>
            </div>
          )}
        </div>
        <div className="category-cards-grid">
          {posts.map((post) => (
            <div key={post.id} className="category-card">
              <div className="category-card-image">
                <Link to={`/article/${post.slug}`}>
                  <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                </Link>
                <Link to={`/categorie/${categorySlug}`} className="category-card-badge" style={{ backgroundColor: getCategoryColor(categorySlug) }}>
                  {categoryName}
                </Link>
              </div>
              <div className="category-card-content">
                <h4 className="category-card-title">
                  <Link to={`/article/${post.slug}`}>
                    {truncate(post.title_fr || post.title, 70)}
                  </Link>
                </h4>
                <span className="category-card-date">
                  <FontAwesome name="clock-o" /> {formatDate(post.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Layout: Featured (1 grand + liste)
  if (layout === "featured") {
    const mainPost = posts[0];
    const sidePosts = posts.slice(1, 5);

    return (
      <div className={`category_section ${className} ${dark ? 'dark_bg' : ''}`}>
        <div className="container">
          <div className="row">
            <div className="col-6 align-self-center">
              <h2 className="widget-title">
                {categoryIcon && <FontAwesome name={categoryIcon} />} {categoryName}
              </h2>
            </div>
            {showSeeAll && (
              <div className="col-6 text-right align-self-center">
                <Link to={`/categorie/${categorySlug}`} className="see_all mb20">
                  Voir tout
                </Link>
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-lg-6">
              <div className="single_post post_type3 mb30">
                <div className="post_img">
                  <div className="img_wrap">
                    <Link to={`/article/${mainPost.slug}`}>
                      <img src={getImageUrl(mainPost.featured_image)} alt={mainPost.title_fr || mainPost.title} />
                    </Link>
                  </div>
                  <Link to={`/categorie/${categorySlug}`} className="category_badge" style={{ backgroundColor: getCategoryColor(categorySlug) }}>
                    {categoryName}
                  </Link>
                </div>
                <div className="single_post_text">
                  <h4>
                    <Link to={`/article/${mainPost.slug}`}>
                      {truncate(mainPost.title_fr || mainPost.title, 80)}
                    </Link>
                  </h4>
                  <p className="post-p">
                    {truncate(mainPost.excerpt_fr || mainPost.excerpt || '', 150)}
                  </p>
                  <span className="post_date">{formatDate(mainPost.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              {sidePosts.map((post, i) => (
                <div key={post.id}>
                  <div className="single_post widgets_small">
                    <div className="post_img">
                      <div className="img_wrap">
                        <Link to={`/article/${post.slug}`}>
                          <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                        </Link>
                      </div>
                    </div>
                    <div className="single_post_text">
                      <div className="meta_info">
                        <Link to={`/categorie/${categorySlug}`} className="category_label" style={{ color: getCategoryColor(categorySlug) }}>
                          {categoryName}
                        </Link>
                        <span className="meta_separator">•</span>
                        <span className="post_date">{formatDate(post.created_at)}</span>
                      </div>
                      <h4>
                        <Link to={`/article/${post.slug}`}>
                          {truncate(post.title_fr || post.title, 60)}
                        </Link>
                      </h4>
                    </div>
                  </div>
                  {i < sidePosts.length - 1 && (
                    <>
                      <div className="space-15" />
                      <div className={dark ? "border_white" : "border_black"} />
                      <div className="space-15" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout: Carousel
  if (layout === "carousel") {
    return (
      <div className={`category_section carousel_section ${className} ${dark ? 'dark_bg' : ''}`}>
        <div className="container">
          <div className="row">
            <div className="col-6 align-self-center">
              <h2 className="widget-title">
                {categoryIcon && <FontAwesome name={categoryIcon} />} {categoryName}
              </h2>
            </div>
            {showSeeAll && (
              <div className="col-6 text-right align-self-center">
                <Link to={`/categorie/${categorySlug}`} className="see_all mb20">
                  Voir tout
                </Link>
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-12">
              <div className="category_carousel nav_style1">
                <Slider
                  navigation={{
                    nextEl: `.swiper-next-${categorySlug}`,
                    prevEl: `.swiper-prev-${categorySlug}`,
                  }}
                  slidesPerView={4}
                  spaceBetween={20}
                  loop={true}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    1024: { slidesPerView: 4, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 20 },
                    320: { slidesPerView: 1, spaceBetween: 10 },
                  }}
                >
                  {posts.map((post) => (
                    <div key={post.id} className="single_post post_type6 post_type7">
                      <div className="post_img gradient1" style={getGradientStyle()}>
                        <Link to={`/article/${post.slug}`}>
                          <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                        </Link>
                        <Link to={`/categorie/${categorySlug}`} className="category_badge" style={{ backgroundColor: getCategoryColor(categorySlug) }}>
                          {categoryName}
                        </Link>
                      </div>
                      <div className="single_post_text">
                        <h4>
                          <Link to={`/article/${post.slug}`}>
                            {truncate(post.title_fr || post.title, 55)}
                          </Link>
                        </h4>
                        <span className="post_date">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </Slider>
                <div className="navBtns">
                  <div className={`navBtn prevtBtn swiper-prev-${categorySlug}`}>
                    <FontAwesome name="angle-left" />
                  </div>
                  <div className={`navBtn nextBtn swiper-next-${categorySlug}`}>
                    <FontAwesome name="angle-right" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout: List (horizontal articles)
  if (layout === "list") {
    return (
      <div className={`category_section list_section ${className} ${dark ? 'dark_bg' : ''}`}>
        <div className="row">
          <div className="col-6 align-self-center">
            <h2 className="widget-title">
              {categoryIcon && <FontAwesome name={categoryIcon} />} {categoryName}
            </h2>
          </div>
          {showSeeAll && (
            <div className="col-6 text-right align-self-center">
              <Link to={`/categorie/${categorySlug}`} className="see_all mb20">
                Voir tout
              </Link>
            </div>
          )}
        </div>
        <div className="row">
          {posts.map((post) => (
            <div key={post.id} className="col-lg-6">
              <div className="single_post post_type3 mb30">
                <div className="post_img">
                  <div className="img_wrap">
                    <Link to={`/article/${post.slug}`}>
                      <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                    </Link>
                  </div>
                  <Link to={`/categorie/${categorySlug}`} className="category_badge" style={{ backgroundColor: getCategoryColor(categorySlug) }}>
                    {categoryName}
                  </Link>
                </div>
                <div className="single_post_text">
                  <h4>
                    <Link to={`/article/${post.slug}`}>
                      {truncate(post.title_fr || post.title, 70)}
                    </Link>
                  </h4>
                  <p className="post-p">
                    {truncate(post.excerpt_fr || post.excerpt || '', 120)}
                  </p>
                  <span className="post_date">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Layout: Events (affichage moderne pour événements)
  if (layout === "events") {
    const getEventDate = (dateString) => {
      if (!dateString) return { day: '--', month: '---' };
      const date = new Date(dateString);
      return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
      };
    };

    return (
      <div className={`category_section events_section ${className} ${dark ? 'dark_bg' : ''}`}>
        <div className="events-header">
          <h2 className="widget-title">
            {categoryIcon && <FontAwesome name={categoryIcon} />} {categoryName}
          </h2>
          {showSeeAll && (
            <Link to={`/categorie/${categorySlug}`} className="events-see-all">
              Voir tous les événements <FontAwesome name="arrow-right" />
            </Link>
          )}
        </div>
        <div className="events-list">
          {posts.map((post, index) => {
            const eventDate = getEventDate(post.created_at);
            return (
              <div key={post.id} className={`event-card ${index === 0 ? 'event-featured' : ''}`}>
                <div className="event-date-badge">
                  <span className="event-day">{eventDate.day}</span>
                  <span className="event-month">{eventDate.month}</span>
                </div>
                <div className="event-image">
                  <Link to={`/article/${post.slug}`}>
                    <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                  </Link>
                  <div className="event-overlay">
                    <Link to={`/article/${post.slug}`} className="event-btn">
                      <FontAwesome name="arrow-right" />
                    </Link>
                  </div>
                </div>
                <div className="event-content">
                  <h4 className="event-title">
                    <Link to={`/article/${post.slug}`}>
                      {truncate(post.title_fr || post.title, 65)}
                    </Link>
                  </h4>
                  <p className="event-excerpt">
                    {truncate(post.excerpt_fr || post.excerpt || '', 80)}
                  </p>
                  <div className="event-meta">
                    <span className="event-location">
                      <FontAwesome name="map-marker" /> International
                    </span>
                    <Link to={`/article/${post.slug}`} className="event-link">
                      En savoir plus <FontAwesome name="chevron-right" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Layout: Grid (default)
  return (
    <div className={`category_section grid_section category-${categorySlug} ${className} ${dark ? 'dark_bg' : ''}`}>
      <div className="row">
        <div className="col-6 align-self-center">
          <h2 className="widget-title">
            {categoryIcon && <FontAwesome name={categoryIcon} />} {categoryName}
          </h2>
        </div>
        {showSeeAll && (
          <div className="col-6 text-right align-self-center">
            <Link to={`/categorie/${categorySlug}`} className="see_all mb20">
              Voir tout
            </Link>
          </div>
        )}
      </div>
      <div className="row">
        {posts.map((post) => (
          <div key={post.id} className="col-lg-3 col-md-6">
            <div className="single_post post_type6 post_type7 mb30">
              <div className="post_img gradient1" style={getGradientStyle()}>
                <Link to={`/article/${post.slug}`}>
                  <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                </Link>
                <Link to={`/categorie/${categorySlug}`} className="category_badge" style={{ backgroundColor: getCategoryColor(categorySlug) }}>
                  {categoryName}
                </Link>
              </div>
              <div className="single_post_text">
                <h4>
                  <Link to={`/article/${post.slug}`}>
                    {truncate(post.title_fr || post.title, 55)}
                  </Link>
                </h4>
                <span className="post_date">{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

CategorySection.propTypes = {
  categorySlug: PropTypes.string.isRequired,
  categoryName: PropTypes.string.isRequired,
  categoryIcon: PropTypes.string,
  layout: PropTypes.oneOf(["grid", "carousel", "list", "featured", "cards", "events"]),
  limit: PropTypes.number,
  showSeeAll: PropTypes.bool,
  dark: PropTypes.bool,
  className: PropTypes.string,
};

export default CategorySection;

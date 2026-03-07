import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { postsApi, getImageUrl as resolveImageUrl } from "../services/api";
import { useApp } from "../context/AppContext";
import Sidebar from "../component/Sidebar";
import FontAwesome from "../component/uiStyle/FontAwesome";
import "./CategoryPage.scss";

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, getCategoryColor } = useApp();

  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const categoryColor = getCategoryColor(slug);

  useEffect(() => {
    // Trouver la catégorie depuis le contexte
    const foundCategory = categories.find(c => c.slug === slug);
    if (foundCategory) {
      setCategory(foundCategory);
    }
  }, [slug, categories]);

  useEffect(() => {
    loadPosts();
  }, [slug, currentPage]);

  const loadPosts = async () => {
    const res = await postsApi.getByCategory(slug, currentPage, 12);
    if (res.success) {
      setPosts(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    }
    setLoading(false);
  };

  const getImageUrl = (path) => resolveImageUrl(path, 'https://via.placeholder.com/400x300/f0f0f0/999999?text=AfricaVet');

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

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convertir hex en rgba
  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Darker shade of color
  const darkenColor = (hex, percent) => {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - percent);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - percent);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - percent);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="category-page">
      {/* Hero Banner */}
      <section className="category-banner-wrapper">
        <div className="container">
          <div
            className="category-banner"
            style={{
              '--category-color': categoryColor,
              '--category-color-dark': darkenColor(categoryColor, 40),
              '--category-color-light': hexToRgba(categoryColor, 0.15)
            }}
          >
            {/* Background decorations */}
            <div className="banner-bg-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>

            <div className="banner-inner">
              {/* Breadcrumb + Article Count Row */}
              <div className="banner-top-row">
                <nav className="banner-breadcrumb">
                  <Link to="/">
                    <FontAwesome name="home" /> Accueil
                  </Link>
                  <span className="separator"><FontAwesome name="angle-right" /></span>
                  <span className="current">{category?.name_fr || category?.name || slug}</span>
                </nav>
                <span className="article-count-badge">
                  <FontAwesome name="file-text-o" />
                  <strong>{pagination.total}</strong> articles
                </span>
              </div>

              {/* Category Title */}
              <div className="banner-content">
                <h1 className="category-title">{category?.name_fr || category?.name || 'Catégorie'}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="category-content">
        <div className="container">
          <div className="row">
            {/* Articles Grid */}
            <div className="col-lg-8">
              {loading ? (
                <div className="loading-grid">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="loading-card">
                      <div className="loading-img"></div>
                      <div className="loading-body">
                        <div className="loading-title"></div>
                        <div className="loading-text"></div>
                        <div className="loading-meta"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FontAwesome name="folder-open-o" />
                  </div>
                  <h3>Aucun article</h3>
                  <p>Il n'y a pas encore d'articles dans cette catégorie.</p>
                  <Link to="/" className="btn-back">
                    <FontAwesome name="arrow-left" /> Retour à l'accueil
                  </Link>
                </div>
              ) : (
                <>
                  <div className="articles-grid">
                    {posts.map((post) => (
                      <article key={post.id} className="article-card">
                        <div className="card-image">
                          <Link to={`/article/${post.slug}`}>
                            <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                            <div className="image-overlay"></div>
                          </Link>
                          <span className="card-badge" style={{ backgroundColor: categoryColor }}>
                            {category?.name_fr || category?.name}
                          </span>
                        </div>
                        <div className="card-body">
                          <div className="card-meta">
                            <span className="meta-date">
                              <FontAwesome name="calendar-o" /> {formatDate(post.created_at)}
                            </span>
                            <span className="meta-views">
                              <FontAwesome name="eye" /> {post.view_count || 0}
                            </span>
                          </div>
                          <h3 className="card-title">
                            <Link to={`/article/${post.slug}`}>
                              {truncate(post.title_fr || post.title, 75)}
                            </Link>
                          </h3>
                          <p className="card-excerpt">
                            {truncate(post.excerpt_fr || post.excerpt || '', 120)}
                          </p>
                          <Link to={`/article/${post.slug}`} className="card-link" style={{ color: categoryColor }}>
                            Lire la suite <FontAwesome name="long-arrow-right" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="pagination-wrapper">
                      <button
                        className="page-btn page-prev"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <FontAwesome name="angle-left" />
                      </button>

                      <div className="page-numbers">
                        {[...Array(pagination.pages)].map((_, i) => {
                          const page = i + 1;
                          if (page === 1 || page === pagination.pages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                              <button
                                key={page}
                                className={`page-num ${currentPage === page ? 'active' : ''}`}
                                onClick={() => handlePageChange(page)}
                                style={currentPage === page ? { backgroundColor: categoryColor } : {}}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="page-dots">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <button
                        className="page-btn page-next"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                      >
                        <FontAwesome name="angle-right" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <Sidebar categorySlug={slug} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { postsApi, getImageUrl as resolveImageUrl } from "../services/api";
import { useApp } from "../context/AppContext";
import Sidebar from "../component/Sidebar";
import FontAwesome from "../component/uiStyle/FontAwesome";
import "./ArticlePage.scss";

const ArticlePage = () => {
  const { slug } = useParams();
  const { getCategoryColor } = useApp();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryColor = post ? getCategoryColor(post.category_slug) : '#1091FF';

  useEffect(() => {
    loadPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    const res = await postsApi.getBySlug(slug);
    if (res.success && res.data) {
      setPost(res.data);

      // Load related posts from same category
      if (res.data.category_slug) {
        const relatedRes = await postsApi.getByCategory(res.data.category_slug, 1, 5);
        if (relatedRes.success) {
          setRelatedPosts((relatedRes.data || []).filter(p => p.id !== res.data.id).slice(0, 4));
        }
      }
    }
    setLoading(false);
  };

  const getImageUrl = (path) => resolveImageUrl(path, 'https://via.placeholder.com/800x400/f0f0f0/999999?text=AfricaVET');

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

  // Convertir hex en rgba
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(16, 145, 255, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Darker shade of color
  const darkenColor = (hex, percent) => {
    if (!hex) return 'rgb(0, 100, 150)';
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - percent);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - percent);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - percent);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title_fr || post?.title || '';

  if (loading) {
    return (
      <div className="article-page">
        <div className="article-banner loading-banner">
          <div className="container">
            <div className="loading-breadcrumb"></div>
            <div className="loading-title"></div>
            <div className="loading-meta"></div>
          </div>
        </div>
        <div className="article-content">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <div className="loading-article">
                  <div className="loading-image"></div>
                  <div className="loading-text"></div>
                  <div className="loading-text short"></div>
                  <div className="loading-text"></div>
                </div>
              </div>
              <div className="col-lg-4">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="article-page">
        <div className="article-content">
          <div className="container">
            <div className="not-found">
              <div className="not-found-icon">
                <FontAwesome name="exclamation-triangle" />
              </div>
              <h2>Article non trouvé</h2>
              <p>L'article que vous recherchez n'existe pas ou a été supprimé.</p>
              <Link to="/" className="btn-back">
                <FontAwesome name="arrow-left" /> Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      {/* Hero Banner */}
      <section className="article-banner-wrapper">
        <div className="container">
          <div
            className="article-banner"
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
              <div className="shape shape-4"></div>
            </div>

            <div className="banner-inner">
          {/* Breadcrumb + Category Badge Row */}
          <div className="banner-top-row">
            <nav className="banner-breadcrumb">
              <Link to="/">
                <FontAwesome name="home" /> Accueil
              </Link>
              <span className="separator"><FontAwesome name="angle-right" /></span>
              {post.category_name && (
                <>
                  <Link to={`/categorie/${post.category_slug}`}>
                    {post.category_name}
                  </Link>
                  <span className="separator"><FontAwesome name="angle-right" /></span>
                </>
              )}
              <span className="current">{truncate(post.title_fr || post.title, 40)}</span>
            </nav>
            {post.category_name && (
              <Link
                to={`/categorie/${post.category_slug}`}
                className="article-category-badge"
              >
                {post.category_name}
              </Link>
            )}
          </div>

          {/* Article Header */}
          <div className="banner-content">
            <h1 className="article-main-title">{post.title_fr || post.title}</h1>
            <div className="article-meta-info">
              <div className="meta-item author">
                <div className="author-avatar">
                  {post.author_first_name ? (
                    <span>{post.author_first_name[0]}{post.author_last_name?.[0] || ''}</span>
                  ) : (
                    <FontAwesome name="user" />
                  )}
                </div>
                <span className="author-name">
                  {post.author_first_name ? `${post.author_first_name} ${post.author_last_name || ''}` : 'AfricaVET'}
                </span>
              </div>
              <div className="meta-item">
                <FontAwesome name="calendar-o" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="meta-item">
                <FontAwesome name="eye" />
                <span>{post.view_count || 0} vues</span>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="article-content">
        <div className="container">
          <div className="row">
            {/* Article Body */}
            <div className="col-lg-8">
              <article className="article-main">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="article-featured-image">
                    <img src={getImageUrl(post.featured_image)} alt={post.title_fr || post.title} />
                    {post.image_caption && (
                      <figcaption className="article-image-caption">{post.image_caption}</figcaption>
                    )}
                  </div>
                )}

                {/* Excerpt */}
                {(post.excerpt_fr || post.excerpt) && (
                  <div className="article-excerpt">
                    <p>{post.excerpt_fr || post.excerpt}</p>
                  </div>
                )}

                {/* Content */}
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: post.content_fr || post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="article-tags">
                    <span className="tags-label">
                      <FontAwesome name="tags" /> Tags:
                    </span>
                    <div className="tags-list">
                      {post.tags.map(tag => (
                        <span key={tag.id} className="tag-item">{tag.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Section */}
                <div className="article-share">
                  <span className="share-label">
                    <FontAwesome name="share-alt" /> Partager cet article:
                  </span>
                  <div className="share-buttons">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn facebook"
                    >
                      <FontAwesome name="facebook" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn twitter"
                    >
                      <FontAwesome name="twitter" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn linkedin"
                    >
                      <FontAwesome name="linkedin" />
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn whatsapp"
                    >
                      <FontAwesome name="whatsapp" />
                    </a>
                    <button
                      className="share-btn copy"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        alert('Lien copié !');
                      }}
                    >
                      <FontAwesome name="link" />
                    </button>
                  </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="related-articles">
                    <h3 className="related-title">
                      <FontAwesome name="newspaper-o" /> Articles Similaires
                    </h3>
                    <div className="related-grid">
                      {relatedPosts.map(relPost => (
                        <div key={relPost.id} className="related-card">
                          <div className="related-image">
                            <Link to={`/article/${relPost.slug}`}>
                              <img src={getImageUrl(relPost.featured_image)} alt={relPost.title_fr} />
                            </Link>
                          </div>
                          <div className="related-content">
                            <h4>
                              <Link to={`/article/${relPost.slug}`}>
                                {truncate(relPost.title_fr || relPost.title, 60)}
                              </Link>
                            </h4>
                            <span className="related-date">
                              <FontAwesome name="clock-o" /> {formatDate(relPost.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <Sidebar categorySlug={post.category_slug} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticlePage;

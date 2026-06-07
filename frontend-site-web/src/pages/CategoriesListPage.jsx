import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { postsApi, getImageUrl as resolveImageUrl } from "../services/api";
import FontAwesome from "../component/uiStyle/FontAwesome";

import adImg1 from "../assets/img/ad/ad-1.png";
import adImg2 from "../assets/img/ad/ad-2.jpg";

const categoryIcons = {
  'elevage': 'leaf', 'peches': 'anchor', 'faune': 'paw',
  'one-health': 'globe', 'sante-animale': 'heartbeat',
  'antibioresistance': 'flask', 'news': 'newspaper-o',
  'actualites': 'newspaper-o', 'zoonoses': 'bug',
  'publications': 'book', 'securite-sanitaire': 'shield',
  'opportunites': 'briefcase', 'veterinaires': 'user-md',
  'videos': 'video-camera', 'covid-19': 'warning',
  'mpox': 'exclamation-triangle', 'rage': 'medkit',
  'article': 'file-text-o', 'analysis': 'line-chart',
  'interview': 'microphone', 'event': 'calendar',
};

const CategoriesListPage = () => {
  const { categories, loading, getCategoryColor } = useApp();
  const activeCategories = categories.filter(c => c.post_count > 0);

  const [activeTab, setActiveTab] = useState('recent');
  const [activeTab2, setActiveTab2] = useState('categories');
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    try {
      const [recentRes, popularRes] = await Promise.all([
        postsApi.getLatest(5),
        postsApi.getPopular(5),
      ]);
      if (recentRes.success) setRecentPosts(recentRes.data || []);
      if (popularRes.success) setPopularPosts(popularRes.data || []);
    } catch (e) {
      console.error('Sidebar load error:', e);
    } finally {
      setSidebarLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const truncate = (text, max) => {
    if (!text) return '';
    return text.length <= max ? text : text.substring(0, max).trim() + '...';
  };

  // Top categories sorted by post_count
  const popularCategories = [...activeCategories]
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, 8);

  const PostItem = ({ post, index, showImage = false }) => (
    <div style={{
      display: 'flex', gap: '12px', padding: '12px 0',
      borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start'
    }}>
      {showImage && post.featured_image ? (
        <Link to={`/article/${post.slug}`} style={{ flexShrink: 0 }}>
          <img
            src={resolveImageUrl(post.featured_image, adImg2)}
            alt=""
            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
          />
        </Link>
      ) : index !== undefined ? (
        <span style={{
          width: '28px', height: '28px', borderRadius: '6px',
          background: 'linear-gradient(135deg, #354e84, #7ac142)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: '700', flexShrink: 0
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/article/${post.slug}`} style={{
          color: '#1f2937', textDecoration: 'none', fontWeight: '600',
          fontSize: '0.85rem', lineHeight: '1.4', display: 'block'
        }}>
          {truncate(post.title_fr || post.title, 65)}
        </Link>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', display: 'flex', gap: '10px' }}>
          <span><FontAwesome name="clock-o" /> {formatDate(post.created_at)}</span>
          {post.view_count > 0 && <span><FontAwesome name="eye" /> {post.view_count}</span>}
        </div>
      </div>
    </div>
  );

  const SkeletonList = ({ count = 4 }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e5e7eb' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', width: '90%', marginBottom: '8px' }} />
            <div style={{ height: '10px', background: '#f3f4f6', borderRadius: '4px', width: '50%' }} />
          </div>
        </div>
      ))}
    </>
  );

  const WidgetHeader = ({ icon, title }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '14px 18px', borderBottom: '2px solid #7ac142',
      background: '#f8faf5'
    }}>
      <FontAwesome name={icon} style={{ color: '#7ac142', fontSize: '1rem' }} />
      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1f2937' }}>{title}</h3>
    </div>
  );

  const widgetStyle = {
    background: '#fff', borderRadius: '12px', overflow: 'hidden',
    border: '1px solid #e5e7eb', marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  };

  return (
    <div className="categories-list-page">
      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #354e84 0%, #7ac142 100%)',
        padding: '50px 0 40px', marginBottom: '40px'
      }}>
        <div className="container">
          <nav style={{ marginBottom: '15px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem' }}>
              <FontAwesome name="home" /> Accueil
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 8px' }}>
              <FontAwesome name="angle-right" />
            </span>
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>Catégories</span>
          </nav>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
            <FontAwesome name="th-large" /> Toutes les catégories
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', marginBottom: 0 }}>
            {activeCategories.length} catégories disponibles
          </p>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="container" style={{ paddingBottom: '60px' }}>
        <div className="row">
          {/* Main: Categories Grid */}
          <div className="col-lg-8">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="spinner-border text-success" role="status" />
                <p className="mt-3 text-muted">Chargement...</p>
              </div>
            ) : (
              <div className="row g-3">
                {activeCategories.map(cat => {
                  const icon = categoryIcons[cat.slug] || 'folder-o';
                  const color = cat.color || '#1091FF';
                  return (
                    <div key={cat.id} className="col-md-6">
                      <Link
                        to={`/categorie/${cat.slug}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '16px 18px', borderRadius: '10px',
                          border: '1px solid #e5e7eb', textDecoration: 'none',
                          color: '#1f2937', transition: 'all 0.2s', backgroundColor: '#fff',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = color;
                          e.currentTarget.style.boxShadow = `0 4px 12px ${color}25`;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '10px',
                          background: `${color}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <FontAwesome name={icon} style={{ fontSize: '18px', color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                            {cat.name_fr || cat.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {cat.post_count} article{cat.post_count > 1 ? 's' : ''}
                          </div>
                        </div>
                        <FontAwesome name="chevron-right" style={{ color: '#9ca3af', fontSize: '0.8rem' }} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Ad Top */}
            <div style={{ ...widgetStyle, textAlign: 'center', position: 'relative' }}>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img src={adImg1} alt="Publicité" style={{ width: '100%', display: 'block', borderRadius: '12px' }} />
              </a>
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.5)', color: '#fff',
                fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>Publicité</span>
            </div>

            {/* Articles récents / populaires (onglets) */}
            <div style={widgetStyle}>
              <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
                {[
                  { key: 'recent', icon: 'clock-o', label: 'Récents' },
                  { key: 'popular', icon: 'fire', label: 'Populaires' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      flex: 1, padding: '12px 10px', border: 'none', cursor: 'pointer',
                      background: activeTab === tab.key ? '#f8faf5' : '#fff',
                      borderBottom: activeTab === tab.key ? '2px solid #7ac142' : '2px solid transparent',
                      marginBottom: '-2px', fontWeight: activeTab === tab.key ? '700' : '500',
                      color: activeTab === tab.key ? '#354e84' : '#6b7280',
                      fontSize: '0.88rem', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <FontAwesome name={tab.icon} style={{ color: activeTab === tab.key ? '#7ac142' : '#9ca3af' }} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '4px 18px 10px' }}>
                {sidebarLoading ? <SkeletonList /> : activeTab === 'recent'
                  ? recentPosts.map((post) => (
                    <PostItem key={post.id} post={post} showImage />
                  ))
                  : popularPosts.map((post, i) => (
                    <PostItem key={post.id} post={post} index={i} />
                  ))
                }
              </div>
            </div>

            {/* Catégories populaires / Les plus partagés (onglets) */}
            <div style={widgetStyle}>
              <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
                {[
                  { key: 'categories', icon: 'star', label: 'Catégories' },
                  { key: 'shared', icon: 'share-alt', label: 'Plus Partagés' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab2(tab.key)}
                    style={{
                      flex: 1, padding: '12px 10px', border: 'none', cursor: 'pointer',
                      background: activeTab2 === tab.key ? '#f8faf5' : '#fff',
                      borderBottom: activeTab2 === tab.key ? '2px solid #7ac142' : '2px solid transparent',
                      marginBottom: '-2px', fontWeight: activeTab2 === tab.key ? '700' : '500',
                      color: activeTab2 === tab.key ? '#354e84' : '#6b7280',
                      fontSize: '0.88rem', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <FontAwesome name={tab.icon} style={{ color: activeTab2 === tab.key ? '#7ac142' : '#9ca3af' }} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab2 === 'categories' ? (
                <div style={{ padding: '10px 18px 14px' }}>
                  {popularCategories.map(cat => {
                    const color = cat.color || '#1091FF';
                    const icon = categoryIcons[cat.slug] || 'folder-o';
                    return (
                      <Link
                        key={cat.id}
                        to={`/categorie/${cat.slug}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 0', borderBottom: '1px solid #f3f4f6',
                          textDecoration: 'none', color: '#1f2937', fontSize: '0.85rem'
                        }}
                      >
                        <FontAwesome name={icon} style={{ color, width: '18px', textAlign: 'center' }} />
                        <span style={{ flex: 1, fontWeight: '500' }}>{cat.name_fr || cat.name}</span>
                        <span style={{
                          background: `${color}15`, color, fontSize: '0.75rem',
                          padding: '2px 8px', borderRadius: '10px', fontWeight: '600'
                        }}>
                          {cat.post_count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '4px 18px 10px' }}>
                  {sidebarLoading ? <SkeletonList count={3} /> : popularPosts.slice(0, 4).map((post) => (
                    <div key={post.id} style={{
                      display: 'flex', gap: '12px', padding: '12px 0',
                      borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start'
                    }}>
                      {post.featured_image && (
                        <Link to={`/article/${post.slug}`} style={{ flexShrink: 0 }}>
                          <img
                            src={resolveImageUrl(post.featured_image, adImg2)}
                            alt=""
                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </Link>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/article/${post.slug}`} style={{
                          color: '#1f2937', textDecoration: 'none', fontWeight: '600',
                          fontSize: '0.85rem', lineHeight: '1.4', display: 'block'
                        }}>
                          {truncate(post.title_fr || post.title, 55)}
                        </Link>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                            <FontAwesome name="facebook" style={{ color: '#1877f2' }} /> Partager
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                            <FontAwesome name="twitter" style={{ color: '#1da1f2' }} /> Tweet
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                            <FontAwesome name="whatsapp" style={{ color: '#25d366' }} /> WhatsApp
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ad Bottom */}
            <div style={{ ...widgetStyle, textAlign: 'center', position: 'relative' }}>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img src={adImg2} alt="Publicité" style={{ width: '100%', display: 'block', borderRadius: '12px' }} />
              </a>
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.5)', color: '#fff',
                fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>Publicité</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesListPage;

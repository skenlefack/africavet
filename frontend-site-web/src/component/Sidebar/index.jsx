import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postsApi, getImageUrl as resolveImageUrl } from "../../services/api";
import { useApp } from "../../context/AppContext";
import FontAwesome from "../uiStyle/FontAwesome";
import NewsLetter from "../NewsLetter";
import "./style.scss";

// Images publicitaires par défaut
import adImg1 from "../../assets/img/ad/ad-1.png";
import adImg2 from "../../assets/img/ad/ad-2.jpg";

const Sidebar = ({ categorySlug = null }) => {
  const { categories, getCategoryColor } = useApp();
  const [mostViewed, setMostViewed] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    try {
      // Charger les articles les plus vus
      const popularRes = await postsApi.getPopular(5);
      if (popularRes.success) {
        setMostViewed(popularRes.data || []);
      }

      // Charger les dernières interviews
      const interviewsRes = await postsApi.getByCategory('interviews', 1, 4);
      if (interviewsRes.success) {
        setInterviews(interviewsRes.data || []);
      }
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const socialLinks = [
    { name: 'facebook', icon: 'facebook', url: 'https://www.facebook.com/africavetwebportail/', color: '#1877f2', followers: '12K+' },
    { name: 'twitter', icon: 'twitter', url: 'https://x.com/africavet', color: '#1da1f2', followers: '8K+' },
    { name: 'whatsapp', icon: 'whatsapp', url: 'https://whatsapp.com/channel/0029Vb7GhhAKrWR4oDYbAS3U', color: '#25D366', followers: '5K+' },
  ];

  return (
    <aside className="modern-sidebar">
      {/* Ad Space Top */}
      <div className="sidebar-ad sidebar-ad-top">
        <a href="#" target="_blank" rel="noopener noreferrer">
          <img src={adImg1} alt="Publicité" />
        </a>
        <span className="ad-label">Publicité</span>
      </div>

      {/* Follow Us */}
      <div className="sidebar-widget follow-widget">
        <div className="widget-header">
          <h3 className="widget-title">
            <FontAwesome name="share-alt" /> Suivez-nous
          </h3>
        </div>
        <div className="social-grid">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-item"
              style={{ '--social-color': social.color }}
            >
              <FontAwesome name={social.icon} />
              <span className="social-count">{social.followers}</span>
              <span className="social-label">Fans</span>
            </a>
          ))}
        </div>
      </div>

      {/* Most Viewed */}
      <div className="sidebar-widget most-viewed-widget">
        <div className="widget-header">
          <h3 className="widget-title">
            <FontAwesome name="fire" /> Les Plus Vus
          </h3>
        </div>
        <div className="posts-list">
          {loading ? (
            <div className="loading-skeleton">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton-item">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text"></div>
                </div>
              ))}
            </div>
          ) : mostViewed.length > 0 ? (
            mostViewed.map((post, index) => (
              <div key={post.id} className="post-item">
                <span className="post-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="post-content">
                  <h4 className="post-title">
                    <Link to={`/article/${post.slug}`}>
                      {truncate(post.title_fr || post.title, 60)}
                    </Link>
                  </h4>
                  <div className="post-meta">
                    <span className="post-views">
                      <FontAwesome name="eye" /> {post.view_count || 0}
                    </span>
                    <span className="post-date">
                      <FontAwesome name="clock-o" /> {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-posts">Aucun article populaire</p>
          )}
        </div>
      </div>

      {/* Newsletter */}
      <div className="sidebar-widget newsletter-widget">
        <div className="newsletter-inner">
          <div className="newsletter-icon">
            <FontAwesome name="envelope-open" />
          </div>
          <h3>Newsletter</h3>
          <p>Inscrivez-vous pour recevoir les dernières actualités directement dans votre boîte mail.</p>
          <NewsLetter />
        </div>
      </div>

      {/* Latest Interviews */}
      <div className="sidebar-widget interviews-widget">
        <div className="widget-header">
          <h3 className="widget-title">
            <FontAwesome name="microphone" /> Dernières Interviews
          </h3>
        </div>
        <div className="interviews-list">
          {interviews.length > 0 ? (
            interviews.map((post) => (
              <div key={post.id} className="interview-item">
                <div className="interview-img">
                  <Link to={`/article/${post.slug}`}>
                    <img src={resolveImageUrl(post.featured_image, adImg2)} alt={post.title_fr || post.title} />
                  </Link>
                  <span className="play-icon">
                    <FontAwesome name="play" />
                  </span>
                </div>
                <div className="interview-content">
                  <h4>
                    <Link to={`/article/${post.slug}`}>
                      {truncate(post.title_fr || post.title, 50)}
                    </Link>
                  </h4>
                  <span className="interview-date">{formatDate(post.created_at)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-posts">Aucune interview disponible</p>
          )}
        </div>
      </div>

      {/* Ad Space Bottom */}
      <div className="sidebar-ad sidebar-ad-bottom">
        <a href="#" target="_blank" rel="noopener noreferrer">
          <img src={adImg2} alt="Publicité" />
        </a>
        <span className="ad-label">Publicité</span>
      </div>
    </aside>
  );
};

export default Sidebar;

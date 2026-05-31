import React, { createContext, useContext, useState, useEffect } from 'react';
import { postsApi, categoriesApi, getImageUrl as resolveImageUrl } from '../services/api';

// Image par défaut
import defaultImg from '../assets/img/post-1.jpg';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

// Constantes pour la troncature harmonisée
const TITLE_LENGTH = {
  SHORT: 50,      // Pour les petits widgets
  MEDIUM: 65,     // Pour les cartes moyennes
  LONG: 80,       // Pour les grandes cartes
  FULL: 100       // Pour les sliders principaux
};

const BODY_LENGTH = {
  SHORT: 80,      // Pour les petits widgets
  MEDIUM: 120,    // Pour les cartes moyennes
  LONG: 150       // Pour les grandes cartes
};

export const DataProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [postsRes, catRes] = await Promise.all([
        postsApi.getLatest(30),
        categoriesApi.getAll()
      ]);

      if (postsRes.success) {
        setPosts(postsRes.data || []);
      } else {
        console.warn('Posts API returned error:', postsRes.message);
        setError(postsRes.message || 'Erreur de chargement des articles');
      }
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Impossible de contacter le serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Helper pour tronquer le texte avec ...
  const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Helper pour obtenir l'URL de l'image
  const getImageUrl = (path) => resolveImageUrl(path, defaultImg);

  // Helper pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Transformer les posts avec troncature harmonisée
  const transformPost = (post, titleLength = TITLE_LENGTH.MEDIUM, bodyLength = BODY_LENGTH.MEDIUM) => {
    const fullTitle = post.title_fr || post.title || '';
    const fullBody = post.excerpt_fr || post.excerpt || '';

    return {
      id: post.id,
      image: getImageUrl(post.featured_image),
      title: truncate(fullTitle, titleLength),
      titleFull: fullTitle,
      body: truncate(fullBody, bodyLength),
      bodyFull: fullBody,
      category: post.category_name || 'Actualités',
      categorySlug: post.category_slug || 'news',
      date: formatDate(post.created_at),
      slug: post.slug,
      viewCount: post.view_count || 0
    };
  };

  const value = {
    posts,
    categories,
    loading,
    error,
    reload: loadData,
    getImageUrl,
    formatDate,
    truncate,
    transformPost,
    TITLE_LENGTH,
    BODY_LENGTH,
    // Posts transformés pour les composants
    get transformedPosts() {
      return posts.map(p => transformPost(p, TITLE_LENGTH.MEDIUM, BODY_LENGTH.MEDIUM));
    },
    // Posts pour le slider principal (titres courts)
    get sliderPosts() {
      return posts.slice(0, 6).map(p => transformPost(p, TITLE_LENGTH.SHORT, BODY_LENGTH.SHORT));
    },
    // Posts pour la galerie (titres longs, descriptions longues)
    get galleryPosts() {
      return posts.slice(0, 9).map(p => transformPost(p, TITLE_LENGTH.FULL, BODY_LENGTH.LONG));
    },
    // Posts pour les features (titres moyens)
    get featurePosts() {
      return posts.slice(0, 8).map(p => transformPost(p, TITLE_LENGTH.MEDIUM, BODY_LENGTH.MEDIUM));
    },
    // Posts pour trending (titres moyens)
    get trendingPosts() {
      return posts.slice(0, 6).map(p => transformPost(p, TITLE_LENGTH.MEDIUM, BODY_LENGTH.MEDIUM));
    },
    // Posts récents pour le widget (titres courts)
    get recentPosts() {
      return posts.slice(0, 5).map(p => transformPost(p, TITLE_LENGTH.SHORT, BODY_LENGTH.SHORT));
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;

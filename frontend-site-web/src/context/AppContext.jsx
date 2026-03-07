import React, { createContext, useContext, useState, useEffect } from 'react';
import { categoriesApi, settingsApi, menusApi } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [mainMenu, setMainMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        // Load categories
        const catRes = await categoriesApi.getAll();
        if (catRes.success) {
          setCategories(catRes.data || []);
        }

        // Load settings
        const settingsRes = await settingsApi.getPublic();
        if (settingsRes.success) {
          setSettings(settingsRes.data || {});
        }

        // Load main menu
        const menuRes = await menusApi.getBySlug('main-menu');
        if (menuRes.success) {
          setMainMenu(menuRes.data?.items || []);
        }
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppData();
  }, []);

  // Couleurs par défaut pour les catégories (fallback si pas définie en BD)
  const defaultCategoryColors = {
    'elevage': '#8B4513',
    'peches': '#1E90FF',
    'faune': '#228B22',
    'one-health': '#00AB6C',
    'sante-animale': '#9B59B6',
    'antibioresistance': '#E74C3C',
    'news': '#1091FF',
    'actualites': '#1091FF',
    'zoonoses': '#C0392B',
    'publications': '#2ECC71',
    'securite-sanitaire': '#3498DB',
    'opportunites': '#8B5CF6',
    'veterinaires': '#E67E22',
    'videos': '#E91E63',
    'covid-19': '#FF5722',
    'mpox': '#FF9800',
    'rage': '#F44336',
    'formations': '#00BCD4',
    'article': '#607D8B',
    'analysis': '#00BCD4',
    'interview': '#9C27B0',
    'event': '#4CAF50',
  };

  const value = {
    categories,
    settings,
    mainMenu,
    loading,
    // Helper to get category by slug
    getCategoryBySlug: (slug) => categories.find(c => c.slug === slug),
    // Helper to get category by ID
    getCategoryById: (id) => categories.find(c => c.id === id),
    // Helper to get category color by slug (from DB or fallback)
    getCategoryColor: (slug) => {
      const cat = categories.find(c => c.slug === slug);
      if (cat && cat.color) return cat.color;
      return defaultCategoryColors[slug] || '#1091FF';
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

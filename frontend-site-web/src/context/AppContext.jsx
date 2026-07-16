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
    // Sujets principaux
    'actualites': '#3463B5',
    'sante-animale': '#9B59B6',
    'one-health': '#00AB6C',
    'elevage': '#8B4513',
    'peches': '#1E90FF',
    'faune': '#228B22',
    'antibioresistance': '#E74C3C',
    'ressources': '#2C3E50',
    // Sous-catégories sujets
    'actualites-institutionnelles': '#3463B5',
    'politiques-publiques': '#3463B5',
    'alertes-sanitaires': '#3463B5',
    'economie-marches': '#3463B5',
    'innovation': '#3463B5',
    'maladies-transfrontalieres': '#9B59B6',
    'maladies-ruminants': '#9B59B6',
    'maladies-aviaires': '#9B59B6',
    'maladies-porcines': '#9B59B6',
    'sante-animaux-aquatiques': '#9B59B6',
    'medicaments-veterinaires': '#9B59B6',
    'services-veterinaires': '#9B59B6',
    'zoonoses-oh': '#00AB6C',
    'securite-sanitaire-aliments': '#00AB6C',
    'environnement-climat': '#00AB6C',
    'preparation-epidemies': '#00AB6C',
    'sante-publique-veterinaire': '#00AB6C',
    'bovins-petits-ruminants': '#8B4513',
    'aviculture': '#8B4513',
    'pastoralisme': '#8B4513',
    'productions-animales': '#8B4513',
    'aquaculture': '#1E90FF',
    'peche-artisanale': '#1E90FF',
    'peche-industrielle': '#1E90FF',
    'conservation': '#228B22',
    'bien-etre-animal': '#228B22',
    'interface-faune-betail': '#228B22',
    'guides': '#2C3E50',
    'fiches-techniques': '#2C3E50',
    'publications-scientifiques': '#2C3E50',
    'rapports': '#2C3E50',
    'outils-numeriques': '#2C3E50',
    'videos-ressources': '#2C3E50',
    'infographies': '#2C3E50',
    // Régions
    'afrique-ouest': '#E67E22',
    'afrique-centrale': '#27AE60',
    'afrique-est': '#3498DB',
    'afrique-australe': '#8E44AD',
    'afrique-nord': '#E74C3C',
    // Legacy slugs
    'news': '#1091FF',
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

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.substring(0, 2) || 'fr';

  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn-sm lang-switch-btn"
      style={{
        background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: 20,
        padding: '3px 14px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: 1,
        minWidth: 40,
        textTransform: 'uppercase',
      }}
      title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
    >
      {currentLang === 'fr' ? 'EN' : 'FR'}
    </button>
  );
};

export default LanguageSwitcher;

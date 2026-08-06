import { useTranslation } from 'react-i18next';

/**
 * Hook to get localized content fields from API objects.
 * Usage: const { lf } = useLocale();
 *        lf(post, 'title') → returns post.title_en or post.title_fr based on current language
 */
export function useLocale() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'fr';

  /**
   * Get localized field from an object.
   * lf(post, 'title') checks post.title_en (if EN) → post.title_fr → post.title
   * lf(post, 'excerpt') checks post.excerpt_en → post.excerpt_fr → post.excerpt
   */
  const lf = (obj, field) => {
    if (!obj) return '';
    if (lang === 'en') {
      return obj[`${field}_en`] || obj[`${field}_fr`] || obj[field] || '';
    }
    return obj[`${field}_fr`] || obj[field] || '';
  };

  /**
   * Get localized category name
   */
  const lcat = (cat) => {
    if (!cat) return '';
    if (lang === 'en') return cat.name_en || cat.name_fr || cat.name || '';
    return cat.name_fr || cat.name || '';
  };

  return { lang, lf, lcat };
}

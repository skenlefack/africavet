const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

function hasConsent() {
  return localStorage.getItem('cookie_consent') === 'accepted';
}

export function initGA(measurementId = GA_MEASUREMENT_ID) {
  if (!hasConsent() || window._gaInitialised) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);
  window._gaInitialised = true;
}

function safeGtag(...args) {
  if (!hasConsent() || typeof window.gtag !== 'function') return;
  window.gtag(...args);
}

export function trackPageView(path, title) {
  safeGtag('event', 'page_view', { page_path: path, page_title: title });
}

export function trackEvent(category, action, label, value) {
  safeGtag('event', action, { event_category: category, event_label: label, value });
}

export function trackNewsletterSignup() { trackEvent('engagement', 'newsletter_signup', 'form'); }
export function trackOpportunityApply(id, title) { trackEvent('engagement', 'opportunity_apply', title, id); }
export function trackWhatsAppClick(title) { trackEvent('social', 'whatsapp_click', title); }
export function trackDownload(fileName) { trackEvent('engagement', 'file_download', fileName); }
export function trackSearch(query, count) { safeGtag('event', 'search', { search_term: query, results_count: count }); }

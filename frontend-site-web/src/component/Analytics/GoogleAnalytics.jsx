import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../../utils/analytics';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('cookie_consent') === 'accepted') {
      initGA();
    }
  }, []);

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return null;
};

export default GoogleAnalytics;

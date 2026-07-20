'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { Lock, UserPlus, LogIn, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Language } from '@/lib/types';

const ACCESS_LIMIT = 10;
const LOCAL_STORAGE_KEY = 'opp_detail_views';

interface AccessState {
  detailViews: number;
  remaining: number;
  isBlocked: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  trackAccess: (pageType: 'listing' | 'detail', opportunityId?: number) => Promise<void>;
}

const AccessContext = createContext<AccessState | undefined>(undefined);

export function useOpportunityAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useOpportunityAccess must be used within OpportunityAccessProvider');
  }
  return context;
}

/**
 * Provider that tracks opportunity page views and gates access after the limit
 */
export function OpportunityAccessProvider({ children, lang }: { children: ReactNode; lang: Language }) {
  const { isAuthenticated, token } = useAuth();
  const [detailViews, setDetailViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check access status on mount
  useEffect(() => {
    checkAccess();
  }, [isAuthenticated]);

  const checkAccess = async () => {
    // Authenticated users always have access
    if (isAuthenticated) {
      setDetailViews(0);
      setIsLoading(false);
      return;
    }

    // Check localStorage first for quick feedback
    const localViews = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '0', 10);
    setDetailViews(localViews);

    // Then verify with server
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/opportunities/check-access', { headers });
      const data = await res.json();

      if (data.success) {
        const serverViews = data.data.detail_views;
        // Use the higher of local vs server (prevents circumvention)
        const effectiveViews = Math.max(localViews, serverViews);
        setDetailViews(effectiveViews);
        localStorage.setItem(LOCAL_STORAGE_KEY, String(effectiveViews));
      }
    } catch {
      // Use localStorage count as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const trackAccess = useCallback(async (pageType: 'listing' | 'detail', opportunityId?: number) => {
    if (isAuthenticated) return; // Don't track authenticated users

    // Increment local count immediately for detail views
    if (pageType === 'detail') {
      const current = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '0', 10);
      const newCount = current + 1;
      localStorage.setItem(LOCAL_STORAGE_KEY, String(newCount));
      setDetailViews(newCount);
    }

    // Track on server (fire and forget)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/opportunities/track-access', {
        method: 'POST',
        headers,
        body: JSON.stringify({ page_type: pageType, opportunity_id: opportunityId || null }),
      });
      const data = await res.json();

      if (data.success && pageType === 'detail') {
        const serverViews = data.data.detail_views;
        const localViews = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) || '0', 10);
        const effectiveViews = Math.max(localViews, serverViews);
        setDetailViews(effectiveViews);
        localStorage.setItem(LOCAL_STORAGE_KEY, String(effectiveViews));
      }
    } catch {
      // Tracking failed, local count is still valid
    }
  }, [isAuthenticated, token]);

  const isBlocked = !isAuthenticated && detailViews >= ACCESS_LIMIT;
  const remaining = isAuthenticated ? 999 : Math.max(0, ACCESS_LIMIT - detailViews);

  return (
    <AccessContext.Provider value={{ detailViews, remaining, isBlocked, isAuthenticated, isLoading, trackAccess }}>
      {children}
    </AccessContext.Provider>
  );
}

/**
 * Gate component that blocks content when access limit is reached
 * Wraps the detail page content
 */
export function OpportunityDetailGate({ children, lang, opportunityId }: { children: ReactNode; lang: Language; opportunityId: number }) {
  const { isBlocked, remaining, isAuthenticated, isLoading, trackAccess } = useOpportunityAccess();
  const [tracked, setTracked] = useState(false);

  // Track this detail view once
  useEffect(() => {
    if (!tracked && !isLoading) {
      trackAccess('detail', opportunityId);
      setTracked(true);
    }
  }, [tracked, isLoading, opportunityId, trackAccess]);

  if (isLoading) return null;

  // Blocked: show the access wall
  if (isBlocked) {
    return <AccessWall lang={lang} />;
  }

  return (
    <>
      {/* Show remaining views banner when approaching limit */}
      {!isAuthenticated && remaining <= 3 && remaining > 0 && (
        <AccessWarningBanner lang={lang} remaining={remaining} />
      )}
      {children}
    </>
  );
}

/**
 * Full-page access wall shown when free views are exhausted
 */
function AccessWall({ lang }: { lang: Language }) {
  const t = {
    title: lang === 'fr' ? 'Accès limité atteint' : 'Free Access Limit Reached',
    subtitle: lang === 'fr'
      ? 'Vous avez consulté vos 10 opportunités gratuites. Créez un compte gratuit pour un accès illimité.'
      : 'You have viewed your 10 free opportunities. Create a free account for unlimited access.',
    benefits: lang === 'fr' ? 'Avantages du compte gratuit' : 'Free Account Benefits',
    benefit1: lang === 'fr' ? 'Accès illimité à toutes les opportunités' : 'Unlimited access to all opportunities',
    benefit2: lang === 'fr' ? 'Postuler directement aux offres' : 'Apply directly to opportunities',
    benefit3: lang === 'fr' ? 'Recevoir des alertes personnalisées' : 'Get personalized alerts',
    benefit4: lang === 'fr' ? 'Sauvegarder vos recherches' : 'Save your searches',
    register: lang === 'fr' ? 'Créer un compte gratuit' : 'Create Free Account',
    login: lang === 'fr' ? 'Se connecter' : 'Sign In',
    hasAccount: lang === 'fr' ? 'Déjà un compte ?' : 'Already have an account?',
    backToList: lang === 'fr' ? 'Retour aux opportunités' : 'Back to opportunities',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Lock icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Lock size={36} className="text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{t.title}</h1>
          <p className="text-gray-600 text-lg">{t.subtitle}</p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t.benefits}</h3>
          <ul className="space-y-3">
            {[t.benefit1, t.benefit2, t.benefit3, t.benefit4].map((benefit, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-700">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Eye size={14} className="text-green-600" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href={`/${lang}/auth/login?redirect=${encodeURIComponent(`/${lang}/opportunities`)}&register=true`}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg text-lg"
          >
            <UserPlus size={22} />
            {t.register}
          </Link>

          <div className="text-center text-gray-500">{t.hasAccount}</div>

          <Link
            href={`/${lang}/auth/login?redirect=${encodeURIComponent(`/${lang}/opportunities`)}`}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <LogIn size={20} />
            {t.login}
          </Link>

          <div className="text-center pt-2">
            <Link
              href={`/${lang}/opportunities`}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              {t.backToList}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Warning banner shown when approaching the access limit
 */
function AccessWarningBanner({ lang, remaining }: { lang: Language; remaining: number }) {
  const message = lang === 'fr'
    ? `Il vous reste ${remaining} consultation${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''}. Créez un compte pour un accès illimité.`
    : `You have ${remaining} free view${remaining > 1 ? 's' : ''} remaining. Create an account for unlimited access.`;

  const cta = lang === 'fr' ? 'Créer un compte' : 'Create account';

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        <Link
          href={`/${lang}/auth/login?register=true`}
          className="text-sm px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium whitespace-nowrap"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

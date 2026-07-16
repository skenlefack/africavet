'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Newspaper, Briefcase, Calendar, ChevronRight, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { getPosts, getOpportunities, getImageUrl } from '@/lib/api';

type Tab = 'all' | 'articles' | 'opportunities';

interface SearchResult {
  type: 'article' | 'opportunity';
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  image?: string;
  date: string;
  category?: string;
  meta?: string;
}

export default function SearchPage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const t = {
    title: lang === 'fr' ? 'Rechercher' : 'Search',
    placeholder: lang === 'fr' ? 'Rechercher des articles, opportunités...' : 'Search articles, opportunities...',
    all: lang === 'fr' ? 'Tout' : 'All',
    articles: lang === 'fr' ? 'Articles' : 'Articles',
    opportunities: lang === 'fr' ? 'Opportunités' : 'Opportunities',
    noResults: lang === 'fr' ? 'Aucun résultat' : 'No results',
    noResultsFor: lang === 'fr' ? 'Aucun résultat pour' : 'No results for',
    resultsFor: lang === 'fr' ? 'résultat(s) pour' : 'result(s) for',
    searchPrompt: lang === 'fr' ? 'Tapez votre recherche pour explorer les articles et opportunités' : 'Type your search to explore articles and opportunities',
  };

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const [postsRes, oppsRes] = await Promise.all([
        activeTab !== 'opportunities' ? getPosts({ search: q, limit: 20, status: 'published' }) : Promise.resolve({ success: true, data: [] }),
        activeTab !== 'articles' ? getOpportunities({ search: q, limit: 20 }) : Promise.resolve({ success: true, data: [] }),
      ]);

      const merged: SearchResult[] = [];

      if (postsRes.success && postsRes.data) {
        for (const p of postsRes.data) {
          merged.push({
            type: 'article',
            id: p.id,
            slug: p.slug,
            title: lang === 'en' && p.title_en ? p.title_en : (p.title_fr || p.title || ''),
            excerpt: lang === 'en' && p.excerpt_en ? p.excerpt_en : (p.excerpt_fr || p.excerpt || ''),
            image: p.featured_image,
            date: p.published_at || p.created_at,
            category: p.category_name || p.category_slug,
          });
        }
      }

      if (oppsRes.success && oppsRes.data) {
        for (const o of oppsRes.data) {
          merged.push({
            type: 'opportunity',
            id: o.id,
            slug: o.slug || String(o.id),
            title: lang === 'en' && o.title_en ? o.title_en : (o.title_fr || ''),
            excerpt: o.organization_name ? `${o.organization_name} — ${o.country || ''}` : o.country || '',
            date: o.created_at,
            meta: o.opportunity_type === 'job' ? (lang === 'fr' ? 'Emploi' : 'Job') :
                  o.opportunity_type === 'tender' ? (lang === 'fr' ? 'Appel d\'offres' : 'Tender') :
                  (lang === 'fr' ? 'Marché' : 'Market'),
          });
        }
      }

      // Sort by date descending
      merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setResults(merged);
    } catch {
      setResults([]);
    }

    setLoading(false);
  }, [activeTab, lang]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const filteredResults = activeTab === 'all' ? results :
    results.filter(r => activeTab === 'articles' ? r.type === 'article' : r.type === 'opportunity');

  const articleCount = results.filter(r => r.type === 'article').length;
  const oppCount = results.filter(r => r.type === 'opportunity').length;

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 md:px-[5%]">
      <div className="container mx-auto max-w-4xl">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h1>

          {/* Search Input */}
          <div className="relative max-w-2xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {searched && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {([
              { key: 'all' as Tab, label: t.all, count: results.length },
              { key: 'articles' as Tab, label: t.articles, count: articleCount, icon: Newspaper },
              { key: 'opportunities' as Tab, label: t.opportunities, count: oppCount, icon: Briefcase },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filteredResults.length} {t.resultsFor} <strong>"{query}"</strong>
            </p>

            {filteredResults.length === 0 ? (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">{t.noResultsFor} "{query}"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.type === 'article'
                      ? `/${lang}/news/${result.slug}`
                      : `/${lang}/opportunities/${result.id}`
                    }
                    className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all"
                  >
                    {/* Thumbnail or Icon */}
                    {result.image ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={getImageUrl(result.image)}
                          alt={result.title}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className={cn(
                        'w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0',
                        result.type === 'article' ? 'bg-blue-50' : 'bg-purple-50'
                      )}>
                        {result.type === 'article'
                          ? <Newspaper size={28} className="text-blue-400" />
                          : <Briefcase size={28} className="text-purple-400" />
                        }
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          result.type === 'article' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        )}>
                          {result.type === 'article' ? t.articles : (result.meta || t.opportunities)}
                        </span>
                        {result.category && (
                          <span className="text-xs text-gray-400">{result.category}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {result.title}
                      </h3>
                      {result.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{result.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <Calendar size={12} />
                        {formatDate(result.date)}
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 mt-6 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !searched && (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">{t.searchPrompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}

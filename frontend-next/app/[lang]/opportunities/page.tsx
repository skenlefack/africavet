'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, FileText, ShoppingBag, Search, Filter, MapPin,
  Calendar, Clock, DollarSign, Building, ChevronRight, Loader2,
  Star, Zap, Globe, Users, TrendingUp
} from 'lucide-react';
import { Language } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

interface Opportunity {
  id: number;
  slug: string;
  opportunity_type: 'job' | 'tender' | 'market';
  title_fr: string;
  title_en?: string;
  description_fr?: string;
  description_en?: string;
  organization_name?: string;
  organization_logo?: string;
  country: string;
  region?: string;
  city?: string;
  is_remote: boolean;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  tender_reference?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  is_featured: boolean;
  is_urgent: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
}

interface Category {
  id: number;
  name_fr: string;
  name_en?: string;
  slug: string;
  opportunity_type: string;
  icon?: string;
}

interface Stats {
  by_type: Array<{ opportunity_type: string; total: number; active: number }>;
  totals: { total: number; active: number; featured: number; urgent: number };
}

interface PageProps {
  params: { lang: string };
}

const TABS = [
  { id: 'all', label_fr: 'Tout', label_en: 'All', icon: TrendingUp },
  { id: 'job', label_fr: 'Emplois', label_en: 'Jobs', icon: Briefcase },
  { id: 'tender', label_fr: 'Appels d\'offres', label_en: 'Tenders', icon: FileText },
  { id: 'market', label_fr: 'Marchés', label_en: 'Markets', icon: ShoppingBag },
];

const JOB_TYPES = {
  full_time: { fr: 'Temps plein', en: 'Full-time' },
  part_time: { fr: 'Temps partiel', en: 'Part-time' },
  contract: { fr: 'Contrat', en: 'Contract' },
  internship: { fr: 'Stage', en: 'Internship' },
  volunteer: { fr: 'Bénévolat', en: 'Volunteer' },
  freelance: { fr: 'Freelance', en: 'Freelance' },
};

export default function OpportunitiesPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const t = {
    title: lang === 'fr' ? 'Opportunités' : 'Opportunities',
    subtitle: lang === 'fr' ? 'Emplois, appels d\'offres et marchés vétérinaires' : 'Veterinary jobs, tenders, and markets',
    search: lang === 'fr' ? 'Rechercher une opportunité...' : 'Search opportunities...',
    postOpportunity: lang === 'fr' ? 'Publier une opportunité' : 'Post an Opportunity',
    noResults: lang === 'fr' ? 'Aucune opportunité trouvée' : 'No opportunities found',
    loading: lang === 'fr' ? 'Chargement...' : 'Loading...',
    viewDetails: lang === 'fr' ? 'Voir les détails' : 'View details',
    deadline: lang === 'fr' ? 'Date limite' : 'Deadline',
    salary: lang === 'fr' ? 'Salaire' : 'Salary',
    budget: lang === 'fr' ? 'Budget' : 'Budget',
    remote: lang === 'fr' ? 'Télétravail' : 'Remote',
    featured: lang === 'fr' ? 'À la une' : 'Featured',
    urgent: lang === 'fr' ? 'Urgent' : 'Urgent',
    applications: lang === 'fr' ? 'candidatures' : 'applications',
    views: lang === 'fr' ? 'vues' : 'views',
    allCategories: lang === 'fr' ? 'Toutes catégories' : 'All categories',
    activeOpportunities: lang === 'fr' ? 'Opportunités actives' : 'Active Opportunities',
    jobs: lang === 'fr' ? 'Emplois' : 'Jobs',
    tenders: lang === 'fr' ? 'Appels d\'offres' : 'Tenders',
    markets: lang === 'fr' ? 'Marchés' : 'Markets',
  };

  useEffect(() => {
    fetchOpportunities();
    fetchCategories();
    fetchStats();
  }, [activeTab, selectedCategory, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOpportunities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (activeTab !== 'all') params.append('type', activeTab);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/opportunities?${params}`);
      const data = await res.json();

      if (data.success) {
        setOpportunities(data.data);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const typeParam = activeTab !== 'all' ? `?type=${activeTab}` : '';
      const res = await fetch(`/api/opportunities/categories${typeParam}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/opportunities/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'XAF') => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat('fr-FR');
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)} ${currency}`;
    }
    if (min) return `${formatter.format(min)}+ ${currency}`;
    if (max) return `${lang === 'fr' ? 'Jusqu\'à' : 'Up to'} ${formatter.format(max)} ${currency}`;
    return null;
  };

  const getJobTypeLabel = (type?: string) => {
    if (!type) return null;
    const labels = JOB_TYPES[type as keyof typeof JOB_TYPES];
    return labels ? (lang === 'fr' ? labels.fr : labels.en) : type;
  };

  const getTypeCount = (type: string) => {
    if (!stats) return 0;
    const stat = stats.by_type.find(s => s.opportunity_type === type);
    return stat?.active || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-[5%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Briefcase size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
                  <p className="text-blue-100">{t.subtitle}</p>
                </div>
              </div>
            </div>

            <Link
              href={`/${lang}/opportunities/submit`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              <FileText size={20} />
              {t.postOpportunity}
            </Link>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totals?.active || 0}</p>
                    <p className="text-sm text-white/70">{t.activeOpportunities}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Briefcase size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{getTypeCount('job')}</p>
                    <p className="text-sm text-white/70">{t.jobs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{getTypeCount('tender')}</p>
                    <p className="text-sm text-white/70">{t.tenders}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{getTypeCount('market')}</p>
                    <p className="text-sm text-white/70">{t.markets}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="max-w-6xl mx-auto px-[5%] -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const count = tab.id === 'all' ? stats?.totals?.active || 0 : getTypeCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Icon size={18} />
                  {lang === 'fr' ? tab.label_fr : tab.label_en}
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">{t.allCategories}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {lang === 'fr' ? cat.name_fr : (cat.name_en || cat.name_fr)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="max-w-6xl mx-auto px-[5%] py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="ml-3 text-gray-500">{t.loading}</span>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noResults}</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/${lang}/opportunities/${opp.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-blue-200 transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Logo/Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {opp.organization_logo ? (
                        <img
                          src={opp.organization_logo}
                          alt={opp.organization_name || ''}
                          className="w-full h-full object-cover object-top rounded-xl"
                        />
                      ) : (
                        opp.opportunity_type === 'job' ? <Briefcase size={24} className="text-blue-500" /> :
                        opp.opportunity_type === 'tender' ? <FileText size={24} className="text-purple-500" /> :
                        <ShoppingBag size={24} className="text-green-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {opp.is_featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            <Star size={12} />
                            {t.featured}
                          </span>
                        )}
                        {opp.is_urgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            <Zap size={12} />
                            {t.urgent}
                          </span>
                        )}
                        {opp.is_remote && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <Globe size={12} />
                            {t.remote}
                          </span>
                        )}
                        {opp.job_type && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {getJobTypeLabel(opp.job_type)}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                        {lang === 'en' && opp.title_en ? opp.title_en : opp.title_fr}
                      </h3>

                      {opp.organization_name && (
                        <p className="text-gray-600 flex items-center gap-1 text-sm mb-2">
                          <Building size={14} />
                          {opp.organization_name}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {opp.region || opp.country}
                          {opp.city && `, ${opp.city}`}
                        </span>

                        {opp.opportunity_type === 'job' && formatSalary(opp.salary_min, opp.salary_max, opp.salary_currency) && (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <DollarSign size={14} />
                            {formatSalary(opp.salary_min, opp.salary_max, opp.salary_currency)}
                          </span>
                        )}

                        {opp.opportunity_type === 'tender' && formatSalary(opp.budget_min, opp.budget_max, 'XAF') && (
                          <span className="flex items-center gap-1 text-purple-600 font-medium">
                            <DollarSign size={14} />
                            {t.budget}: {formatSalary(opp.budget_min, opp.budget_max, 'XAF')}
                          </span>
                        )}

                        {opp.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {t.deadline}: {formatDate(opp.deadline, lang)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Arrow */}
                    <div className="hidden md:flex items-center">
                      <ChevronRight size={24} className="text-gray-300" />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {opp.applications_count} {t.applications}
                      </span>
                      <span>{opp.views_count} {t.views}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(opp.created_at, lang)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={cn(
                  'w-10 h-10 rounded-lg font-medium transition-all',
                  page === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

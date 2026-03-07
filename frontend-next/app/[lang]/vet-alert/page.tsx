'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, Bell, MapPin, Calendar, ChevronRight, Search,
  Filter, X, Loader2, Shield, Clock, Users, Activity
} from 'lucide-react';
import { Language } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

interface VetAlert {
  id: number;
  code: string;
  alert_type: string;
  title_fr: string;
  title_en?: string;
  description_fr?: string;
  description_en?: string;
  country: string;
  region?: string;
  city?: string;
  disease_name?: string;
  affected_count: number;
  dead_count: number;
  status: string;
  priority: string;
  created_at: string;
  photo_count: number;
}

interface PageProps {
  params: { lang: string };
}

const ALERT_TYPES = [
  { id: 'all', label_fr: 'Toutes', label_en: 'All' },
  { id: 'disease_outbreak', label_fr: 'Foyer de maladie', label_en: 'Disease Outbreak' },
  { id: 'emergency', label_fr: 'Urgence', label_en: 'Emergency' },
  { id: 'vaccination_campaign', label_fr: 'Campagne de vaccination', label_en: 'Vaccination Campaign' },
  { id: 'food_safety', label_fr: 'Sécurité alimentaire', label_en: 'Food Safety' },
  { id: 'wildlife', label_fr: 'Faune sauvage', label_en: 'Wildlife' },
];

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', label_fr: 'Critique', label_en: 'Critical' },
  high: { color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', label_fr: 'Élevée', label_en: 'High' },
  medium: { color: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', label_fr: 'Moyenne', label_en: 'Medium' },
  low: { color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', label_fr: 'Faible', label_en: 'Low' },
};

export default function VetAlertPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;

  const [alerts, setAlerts] = useState<VetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const t = {
    title: lang === 'fr' ? 'VET Alert' : 'VET Alert',
    subtitle: lang === 'fr' ? 'Système d\'alertes sanitaires vétérinaires' : 'Veterinary Health Alert System',
    search: lang === 'fr' ? 'Rechercher une alerte...' : 'Search alerts...',
    reportAlert: lang === 'fr' ? 'Signaler une alerte' : 'Report an Alert',
    noAlerts: lang === 'fr' ? 'Aucune alerte trouvée' : 'No alerts found',
    loading: lang === 'fr' ? 'Chargement...' : 'Loading...',
    viewDetails: lang === 'fr' ? 'Voir les détails' : 'View details',
    affected: lang === 'fr' ? 'affectés' : 'affected',
    deaths: lang === 'fr' ? 'morts' : 'deaths',
    allTypes: lang === 'fr' ? 'Tous les types' : 'All types',
    allPriorities: lang === 'fr' ? 'Toutes priorités' : 'All priorities',
    activeAlerts: lang === 'fr' ? 'Alertes actives' : 'Active Alerts',
    resolved: lang === 'fr' ? 'Résolues' : 'Resolved',
    critical: lang === 'fr' ? 'Critiques' : 'Critical',
    totalAffected: lang === 'fr' ? 'Animaux affectés' : 'Animals Affected',
  };

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [selectedType, selectedPriority, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlerts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        status: 'approved',
      });
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedPriority !== 'all') params.append('priority', selectedPriority);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/vet-alerts?${params}`);
      const data = await res.json();

      if (data.success) {
        setAlerts(data.data);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/vet-alerts/stats/summary');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  };

  const getAlertTypeLabel = (type: string) => {
    const alertType = ALERT_TYPES.find(t => t.id === type);
    return alertType ? (lang === 'fr' ? alertType.label_fr : alertType.label_en) : type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-orange-600 text-white py-16 px-[5%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Bell size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
                  <p className="text-red-100">{t.subtitle}</p>
                </div>
              </div>
            </div>

            <Link
              href={`/${lang}/vet-alert/submit`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all shadow-lg"
            >
              <AlertTriangle size={20} />
              {t.reportAlert}
            </Link>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Activity size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totals?.approved || 0}</p>
                    <p className="text-sm text-white/70">{t.activeAlerts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totals?.resolved || 0}</p>
                    <p className="text-sm text-white/70">{t.resolved}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totals?.critical || 0}</p>
                    <p className="text-sm text-white/70">{t.critical}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Users size={24} className="text-white/80" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totals?.total_affected || 0}</p>
                    <p className="text-sm text-white/70">{t.totalAffected}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-6xl mx-auto px-[5%] -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              {ALERT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {lang === 'fr' ? type.label_fr : type.label_en}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="all">{t.allPriorities}</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {lang === 'fr' ? config.label_fr : config.label_en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-w-6xl mx-auto px-[5%] py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-red-500" />
            <span className="ml-3 text-gray-500">{t.loading}</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.noAlerts}</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => {
              const priority = getPriorityConfig(alert.priority);

              return (
                <Link
                  key={alert.id}
                  href={`/${lang}/vet-alert/${alert.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all overflow-hidden"
                >
                  {/* Priority Bar */}
                  <div className={cn('h-1.5', priority.color)} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                        priority.bg, priority.text
                      )}>
                        <AlertTriangle size={12} />
                        {lang === 'fr' ? priority.label_fr : priority.label_en}
                      </span>
                      <span className="text-xs text-gray-400">{alert.code}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {lang === 'en' && alert.title_en ? alert.title_en : alert.title_fr}
                    </h3>

                    {/* Type Badge */}
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium mb-3">
                      {getAlertTypeLabel(alert.alert_type)}
                    </span>

                    {/* Disease Name */}
                    {alert.disease_name && (
                      <p className="text-sm text-red-600 font-medium mb-3">
                        {alert.disease_name}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {alert.affected_count > 0 && (
                        <span>{alert.affected_count} {t.affected}</span>
                      )}
                      {alert.dead_count > 0 && (
                        <span className="text-red-500">{alert.dead_count} {t.deaths}</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={12} />
                        <span>{alert.region || alert.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={12} />
                        <span>{formatDate(alert.created_at, lang)}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-red-600 group-hover:gap-2 transition-all">
                      {t.viewDetails}
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
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
                    ? 'bg-red-500 text-white'
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

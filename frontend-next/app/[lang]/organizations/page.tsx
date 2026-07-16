'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, MapPin, Globe, Search, Loader2, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { getImageUrl } from '@/lib/api';

interface Organization {
  id: number;
  name: string;
  acronym?: string;
  type: string;
  logo?: string;
  country?: string;
  city?: string;
  region?: string;
  website?: string;
  description?: string;
}

export default function OrganizationsPage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const t = {
    title: lang === 'fr' ? 'Annuaire des organisations' : 'Organizations Directory',
    subtitle: lang === 'fr' ? 'Organisations vétérinaires et partenaires en Afrique' : 'Veterinary organizations and partners in Africa',
    search: lang === 'fr' ? 'Rechercher une organisation...' : 'Search organizations...',
    noResults: lang === 'fr' ? 'Aucune organisation trouvée' : 'No organizations found',
    viewProfile: lang === 'fr' ? 'Voir la fiche' : 'View profile',
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchOrganizations(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '24' });
      if (search) params.append('search', search);
      const res = await fetch(`/api/mapping/organizations?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrganizations(data.data);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 md:px-[5%]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-sm font-semibold text-blue-700 mb-3">
            <Building2 size={16} />
            {t.title}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map(org => (
              <Link
                key={org.id}
                href={`/${lang}/organizations/${org.id}`}
                className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-4">
                  {org.logo ? (
                    <img src={getImageUrl(org.logo)} alt={org.name} className="w-14 h-14 rounded-lg object-contain bg-gray-50 p-1" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Building2 size={24} className="text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {org.name}
                    </h3>
                    {org.acronym && <span className="text-xs text-gray-400 font-medium">{org.acronym}</span>}
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      {[org.city, org.country].filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 mt-2 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                  page === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Search, Filter, ChevronDown, Mail, Phone, Globe, X,
  Building2, FlaskConical, Pill, Ambulance, School, Building,
  Stethoscope, Truck, Heart, ArrowRight, Loader2, SlidersHorizontal,
  Grid3X3, List, Clock, Star, CheckCircle
} from 'lucide-react';
import { Language } from '@/lib/types';
import {
  getOHWRStats, getOHWRRegions, getOHWROrganizations
} from '@/lib/api';
import { OHWRStats, OHWRRegion, OHWROrganization } from '@/lib/types';
import { cn, getImageUrl } from '@/lib/utils';

// VET LINK Category definitions
const VET_CATEGORIES = [
  { id: 'all', slug: 'all', icon: Search, color: '#16a34a', label_fr: 'Tout', label_en: 'All' },
  { id: 'vet-clinic', slug: 'vet-clinic', icon: Stethoscope, color: '#2563eb', label_fr: 'Cliniques / Cabinets', label_en: 'Clinics / Practices' },
  { id: 'vet-hospital', slug: 'vet-hospital', icon: Building2, color: '#dc2626', label_fr: 'Hôpitaux vétérinaires', label_en: 'Veterinary Hospitals' },
  { id: 'emergency', slug: 'emergency', icon: Ambulance, color: '#ea580c', label_fr: 'Urgences / Garde', label_en: 'Emergency Services' },
  { id: 'vet-lab', slug: 'vet-lab', icon: FlaskConical, color: '#7c3aed', label_fr: 'Laboratoires', label_en: 'Laboratories' },
  { id: 'vet-pharmacy', slug: 'vet-pharmacy', icon: Pill, color: '#0891b2', label_fr: 'Pharmacies / Distributeurs', label_en: 'Pharmacies / Distributors' },
  { id: 'mobile-service', slug: 'mobile-service', icon: Truck, color: '#65a30d', label_fr: 'Services mobiles / ruraux', label_en: 'Mobile / Rural Services' },
  { id: 'field-ngo', slug: 'field-ngo', icon: Heart, color: '#db2777', label_fr: 'ONG & Projets terrain', label_en: 'NGOs & Field Projects' },
  { id: 'vet-school', slug: 'vet-school', icon: School, color: '#f59e0b', label_fr: 'Écoles / Formations', label_en: 'Schools / Training' },
  { id: 'vet-directorate', slug: 'vet-directorate', icon: Building, color: '#6366f1', label_fr: 'Services officiels', label_en: 'Official Services' },
];

interface SearchResult {
  id: number;
  name: string;
  acronym?: string;
  type: string;
  description?: string;
  logo?: string;
  region?: string;
  city?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  specialties?: string[];
  services?: string[];
  emergency_available?: boolean;
  species_treated?: string[];
  opening_hours?: any;
}

interface PageProps {
  params: { lang: string };
  searchParams?: { category?: string };
}

export default function VetLinkPage({ params, searchParams }: PageProps) {
  const lang = (params.lang || 'fr') as Language;
  const initialCategory = searchParams?.category || 'all';
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter state
  const [selectedRegion, setSelectedRegion] = useState('');

  // Data
  const [stats, setStats] = useState<OHWRStats | null>(null);
  const [regions, setRegions] = useState<OHWRRegion[]>([]);

  // Selected item for detail modal
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // Translations
  const t = {
    title: lang === 'fr' ? 'VET LINK' : 'VET LINK',
    subtitle: lang === 'fr' ? 'Annuaire Vétérinaire Panafricain' : 'Pan-African Veterinary Directory',
    searchPlaceholder: lang === 'fr'
      ? 'Rechercher cliniques, laboratoires, pharmacies...'
      : 'Search clinics, laboratories, pharmacies...',
    search: lang === 'fr' ? 'Rechercher' : 'Search',
    allRegions: lang === 'fr' ? 'Toutes les régions' : 'All regions',
    noResults: lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found',
    tryDifferent: lang === 'fr'
      ? 'Essayez de modifier votre recherche ou utilisez des termes différents.'
      : 'Try modifying your search or use different terms.',
    resultsFound: lang === 'fr' ? 'résultats trouvés' : 'results found',
    searching: lang === 'fr' ? 'Recherche en cours...' : 'Searching...',
    filters: 'Filtres',
    reset: lang === 'fr' ? 'Réinitialiser' : 'Reset',
    region: lang === 'fr' ? 'Région' : 'Region',
    explore: lang === 'fr' ? 'Explorer' : 'Explore',
    contact: 'Contact',
    website: lang === 'fr' ? 'Site web' : 'Website',
    emergency: lang === 'fr' ? 'Urgences 24/7' : '24/7 Emergency',
    services: 'Services',
    specialties: lang === 'fr' ? 'Spécialités' : 'Specialties',
    species: lang === 'fr' ? 'Espèces traitées' : 'Species treated',
    hours: lang === 'fr' ? 'Horaires' : 'Opening hours',
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Initialize search if category is in URL
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setSelectedCategory(initialCategory);
      performSearch(1, initialCategory);
    }
  }, [initialCategory]);

  const fetchInitialData = async () => {
    const [statsRes, regionsRes] = await Promise.all([
      getOHWRStats(),
      getOHWRRegions()
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (regionsRes.success) setRegions(regionsRes.data);
  };

  const performSearch = useCallback(async (page: number = 1, forcedCategory?: string) => {
    const activeCategory = forcedCategory || selectedCategory;
    const hasFilters = searchQuery.trim() || selectedRegion || activeCategory !== 'all';

    if (!hasFilters) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setCurrentPage(page);

    try {
      // Map VET LINK categories to organization types
      const typeMapping: Record<string, string> = {
        'vet-clinic': 'clinic',
        'vet-hospital': 'hospital',
        'emergency': 'emergency',
        'vet-lab': 'laboratory',
        'vet-pharmacy': 'pharmacy',
        'mobile-service': 'mobile',
        'field-ngo': 'ngo',
        'vet-school': 'school',
        'vet-directorate': 'government',
      };

      const orgsRes = await getOHWROrganizations({
        search: searchQuery,
        region: selectedRegion,
        type: activeCategory !== 'all' ? (typeMapping[activeCategory] || activeCategory) : undefined,
        limit: ITEMS_PER_PAGE,
        page: page
      });

      if (orgsRes.success && orgsRes.data) {
        const results: SearchResult[] = orgsRes.data.map((org: OHWROrganization) => ({
          id: org.id,
          name: org.name + (org.acronym ? ` (${org.acronym})` : ''),
          acronym: org.acronym,
          type: org.type,
          description: org.description,
          logo: org.logo,
          region: org.region,
          city: org.city,
          address: org.address,
          contact_email: org.contact_email,
          contact_phone: org.contact_phone,
          website: org.website,
          // These fields would come from the extended schema
          specialties: [],
          services: [],
          emergency_available: false,
          species_treated: [],
          opening_hours: null,
        }));

        setSearchResults(results);

        if (orgsRes.pagination) {
          setTotalResults(orgsRes.pagination.total);
          setTotalPages(orgsRes.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedCategory, selectedRegion]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || selectedRegion || selectedCategory !== 'all') {
        performSearch(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedRegion, performSearch]);

  const handlePageChange = (page: number) => {
    performSearch(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    performSearch(1, categoryId);
  };

  const getCategoryInfo = (type: string) => {
    const category = VET_CATEGORIES.find(c => c.slug === type || c.id === type);
    return category || VET_CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-green-200/30" />
          <div className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-green-300/20" />
          <div className="absolute top-10 left-[10%] w-32 h-32 rounded-full blur-3xl opacity-20 bg-green-400" />
          <div className="absolute top-20 right-[10%] w-40 h-40 rounded-full blur-3xl opacity-15 bg-emerald-400" />
        </div>

        <div className={cn(
          "relative max-w-5xl mx-auto px-4 text-center transition-all duration-500",
          hasSearched ? "py-8" : "py-12 md:py-16"
        )}>
          {/* Logo & Title */}
          <div className={cn(
            "transition-all duration-500",
            hasSearched ? "mb-5" : "mb-8"
          )}>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div
                className={cn(
                  "rounded-2xl flex items-center justify-center transition-all shadow-xl bg-gradient-to-br from-green-500 to-emerald-600",
                  hasSearched ? "w-12 h-12" : "w-16 h-16"
                )}
              >
                <MapPin size={hasSearched ? 24 : 32} className="text-white" />
              </div>
              <h1
                className={cn(
                  "font-black tracking-tight transition-all text-green-700",
                  hasSearched ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
                )}
              >
                {t.title}
              </h1>
            </div>
            {!hasSearched && (
              <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                {t.subtitle}
              </p>
            )}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-4xl mx-auto">
            <div className={cn(
              "relative bg-white rounded-2xl transition-all border-2",
              hasSearched ? "shadow-lg border-gray-200" : "shadow-2xl shadow-green-100/50 border-green-200/60"
            )}>
              {/* Search Input */}
              <div className="flex items-center">
                <div className="pl-6">
                  <Search className="text-green-500" size={26} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="flex-1 px-5 py-5 text-lg text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                />
                {isSearching && (
                  <Loader2 className="animate-spin text-green-500 mr-4" size={26} />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setHasSearched(false); }}
                    className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={22} className="text-gray-400" />
                  </button>
                )}
                <button
                  type="submit"
                  className="m-2 px-8 py-3.5 rounded-xl font-bold text-white text-base transition-all hover:scale-105 hover:shadow-lg bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  {t.search}
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 px-4 pb-4 pt-3 border-t border-green-100/50 overflow-x-auto">
                {VET_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                      selectedCategory === cat.id
                        ? "text-white shadow-lg"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                    )}
                    style={{
                      background: selectedCategory === cat.id ? cat.color : undefined
                    }}
                  >
                    <cat.icon size={18} />
                    {lang === 'fr' ? cat.label_fr : cat.label_en}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Quick Stats (only when no search) */}
          {!hasSearched && stats && (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {VET_CATEGORIES.slice(1, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-100/50 transition-all group"
                >
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: `${cat.color}15` }}
                  >
                    <cat.icon size={24} style={{ color: cat.color }} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    {lang === 'fr' ? cat.label_fr : cat.label_en}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600">
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    {t.searching}
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-gray-900">{totalResults}</span>
                    {' '}{t.resultsFound}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                  showFilters ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <SlidersHorizontal size={16} />
                {t.filters}
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    viewMode === 'grid' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  )}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    viewMode === 'list' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  )}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.region}
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="">{t.allRegions}</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setSelectedRegion(''); }}
                    className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    {t.reset}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid/List */}
          {searchResults.length === 0 && !isSearching ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {t.noResults}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t.tryDifferent}
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            )}>
              {searchResults.map((result) => {
                const categoryInfo = getCategoryInfo(result.type);

                return viewMode === 'grid' ? (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg border border-gray-100 hover:border-green-200 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: result.logo ? `url(${getImageUrl(result.logo)}) center/cover` : `${categoryInfo.color}15`
                        }}
                      >
                        {!result.logo && <categoryInfo.icon size={24} style={{ color: categoryInfo.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                          {result.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {lang === 'fr' ? categoryInfo.label_fr : categoryInfo.label_en}
                        </p>
                        {result.emergency_available && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                            <Ambulance size={10} />
                            {t.emergency}
                          </span>
                        )}
                      </div>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    {result.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{result.description}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                      {result.region && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10} /> {result.region}{result.city && `, ${result.city}`}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 hover:border-green-200 transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: result.logo ? `url(${getImageUrl(result.logo)}) center/cover` : `${categoryInfo.color}15`
                      }}
                    >
                      {!result.logo && <categoryInfo.icon size={20} style={{ color: categoryInfo.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                          {result.name}
                        </h3>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0"
                          style={{ background: `${categoryInfo.color}15`, color: categoryInfo.color }}
                        >
                          <categoryInfo.icon size={10} />
                          {lang === 'fr' ? categoryInfo.label_fr : categoryInfo.label_en}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{result.region}{result.city && `, ${result.city}`}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {searchResults.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {lang === 'fr' ? 'Précédent' : 'Previous'}
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg font-medium transition-all",
                        currentPage === pageNum
                          ? "bg-green-500 text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {lang === 'fr' ? 'Suivant' : 'Next'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedResult && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedResult(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              {(() => {
                const categoryInfo = getCategoryInfo(selectedResult.type);
                return (
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ background: `${categoryInfo.color}15`, color: categoryInfo.color }}
                  >
                    <categoryInfo.icon size={14} />
                    {lang === 'fr' ? categoryInfo.label_fr : categoryInfo.label_en}
                  </span>
                );
              })()}
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex gap-5 mb-6">
                {(() => {
                  const categoryInfo = getCategoryInfo(selectedResult.type);
                  return (
                    <div
                      className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: selectedResult.logo
                          ? `url(${getImageUrl(selectedResult.logo)}) center/cover`
                          : `${categoryInfo.color}15`
                      }}
                    >
                      {!selectedResult.logo && <categoryInfo.icon size={36} style={{ color: categoryInfo.color }} />}
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedResult.name}</h2>
                  {selectedResult.region && (
                    <p className="flex items-center gap-2 text-gray-500">
                      <MapPin size={14} /> {selectedResult.region}{selectedResult.city && `, ${selectedResult.city}`}
                    </p>
                  )}
                  {selectedResult.emergency_available && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600">
                      <Ambulance size={14} />
                      {t.emergency}
                    </span>
                  )}
                </div>
              </div>

              {selectedResult.description && (
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed">{selectedResult.description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                {selectedResult.contact_email && (
                  <a href={`mailto:${selectedResult.contact_email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-700">{selectedResult.contact_email}</span>
                  </a>
                )}
                {selectedResult.contact_phone && (
                  <a href={`tel:${selectedResult.contact_phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-gray-700">{selectedResult.contact_phone}</span>
                  </a>
                )}
                {selectedResult.website && (
                  <a href={selectedResult.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Globe size={18} className="text-gray-400" />
                    <span className="text-gray-700">{selectedResult.website}</span>
                  </a>
                )}
                {selectedResult.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-700">{selectedResult.address}</span>
                  </div>
                )}
              </div>

              {/* Services & Specialties */}
              {selectedResult.services && selectedResult.services.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t.services}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.services.map((service, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedResult.species_treated && selectedResult.species_treated.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t.species}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.species_treated.map((species, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {species}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

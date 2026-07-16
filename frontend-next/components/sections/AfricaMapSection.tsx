'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Newspaper, Briefcase, ChevronRight, Rss } from 'lucide-react';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RegionData {
  id: string;
  slug: string;
  label: { fr: string; en: string };
  color: string;
  bgColor: string;
  gradient: string;
  countries: string[];
}

const regions: RegionData[] = [
  {
    id: 'west',
    slug: 'afrique-ouest',
    label: { fr: 'Afrique de l\'Ouest', en: 'West Africa' },
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    gradient: 'from-orange-500 to-amber-500',
    countries: ['Sénégal', 'Mali', 'Burkina Faso', 'Côte d\'Ivoire', 'Ghana', 'Nigéria', 'Niger', 'Guinée', 'Bénin', 'Togo', 'Sierra Leone', 'Libéria', 'Gambie', 'Guinée-Bissau', 'Cap-Vert'],
  },
  {
    id: 'central',
    slug: 'afrique-centrale',
    label: { fr: 'Afrique centrale', en: 'Central Africa' },
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    gradient: 'from-emerald-500 to-green-500',
    countries: ['Cameroun', 'RD Congo', 'Congo', 'Gabon', 'Centrafrique', 'Tchad', 'Guinée équatoriale', 'São Tomé-et-Príncipe'],
  },
  {
    id: 'east',
    slug: 'afrique-est',
    label: { fr: 'Afrique de l\'Est', en: 'East Africa' },
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    gradient: 'from-blue-500 to-cyan-500',
    countries: ['Kenya', 'Tanzanie', 'Ouganda', 'Éthiopie', 'Rwanda', 'Burundi', 'Somalie', 'Djibouti', 'Érythrée', 'Soudan du Sud'],
  },
  {
    id: 'southern',
    slug: 'afrique-australe',
    label: { fr: 'Afrique australe', en: 'Southern Africa' },
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    gradient: 'from-purple-500 to-violet-500',
    countries: ['Afrique du Sud', 'Mozambique', 'Zimbabwe', 'Zambie', 'Malawi', 'Botswana', 'Namibie', 'Madagascar', 'Maurice', 'Eswatini', 'Lesotho', 'Seychelles', 'Comores'],
  },
  {
    id: 'north',
    slug: 'afrique-nord',
    label: { fr: 'Afrique du Nord', en: 'North Africa' },
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    gradient: 'from-red-500 to-rose-500',
    countries: ['Maroc', 'Algérie', 'Tunisie', 'Libye', 'Égypte', 'Soudan', 'Mauritanie'],
  },
];

interface AfricaMapSectionProps {
  lang: Language;
  className?: string;
}

export function AfricaMapSection({ lang, className }: AfricaMapSectionProps) {
  const [countryData, setCountryData] = useState<Record<string, { posts: number; opportunities: number }>>({});

  useEffect(() => {
    fetch('/api/analytics/content-by-country')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const map: Record<string, { posts: number; opportunities: number }> = {};
          for (const item of data.data) {
            map[item.country] = { posts: item.posts, opportunities: item.opportunities };
          }
          setCountryData(map);
        }
      })
      .catch(() => {});
  }, []);

  // Count content for a region's countries
  const getRegionCounts = (countries: string[]) => {
    let posts = 0, opps = 0;
    for (const c of countries) {
      if (countryData[c]) { posts += countryData[c].posts; opps += countryData[c].opportunities; }
    }
    return { posts, opps };
  };

  const t = {
    title: lang === 'fr' ? 'Explorer par région' : 'Explore by Region',
    subtitle: lang === 'fr'
      ? 'Découvrez les actualités et opportunités par zone géographique'
      : 'Discover news and opportunities by geographic area',
    countries: lang === 'fr' ? 'pays' : 'countries',
    explore: lang === 'fr' ? 'Explorer' : 'Explore',
    news: lang === 'fr' ? 'Actualités' : 'News',
    opportunities: lang === 'fr' ? 'Opportunités' : 'Opportunities',
  };

  return (
    <section className={cn('py-16 px-4 md:px-[5%]', className)}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-emerald-50 text-sm font-semibold text-blue-700 mb-3">
            <MapPin size={16} />
            {t.title}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={cn(
                'group relative rounded-2xl border border-gray-100 overflow-hidden',
                'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer'
              )}>
                {/* Gradient header */}
                <div className={cn('h-2 bg-gradient-to-r', region.gradient)} />

                <div className="p-5">
                  {/* Region name */}
                  <h3 className={cn('font-bold text-lg mb-1', region.color)}>
                    {region.label[lang]}
                  </h3>

                  {/* Country count */}
                  <p className="text-xs text-gray-400 mb-4">
                    {region.countries.length} {t.countries}
                  </p>

                  {/* Action links with counts */}
                  {(() => {
                    const counts = getRegionCounts(region.countries);
                    return (
                      <div className="space-y-2">
                        <a
                          href={`/${lang}/news?region=${region.slug}`}
                          className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Newspaper size={14} className={region.color} />
                            {t.news}
                          </span>
                          <span className="flex items-center gap-1">
                            {counts.posts > 0 && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{counts.posts}</span>}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </a>
                        <a
                          href={`/${lang}/opportunities?region=${region.slug}`}
                          className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Briefcase size={14} className={region.color} />
                            {t.opportunities}
                          </span>
                          <span className="flex items-center gap-1">
                            {counts.opps > 0 && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{counts.opps}</span>}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </a>
                      </div>
                    );
                  })()}

                  {/* Countries preview */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {region.countries.slice(0, 6).join(', ')}
                      {region.countries.length > 6 && '...'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

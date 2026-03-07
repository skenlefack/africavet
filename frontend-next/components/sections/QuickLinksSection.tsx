'use client';

import { motion } from 'framer-motion';
import {
  Building2, FlaskConical, Pill, Siren, School, Building,
  Search, MapPin, Phone, ArrowRight, Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { AnimatedSection, AnimatedItem, staggerContainer } from '@/components/ui/AnimatedSection';
import { GlassCard } from '@/components/ui/GlassCard';

interface QuickLinksSectionProps {
  lang: Language;
  t: Translation;
  className?: string;
}

const vetCategories = [
  {
    id: 'vet-clinic',
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    id: 'vet-lab',
    icon: FlaskConical,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    id: 'vet-pharmacy',
    icon: Pill,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  {
    id: 'emergency',
    icon: Siren,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    id: 'vet-school',
    icon: School,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    id: 'vet-directorate',
    icon: Building,
    color: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
  },
];

const categoryLabels: Record<string, { fr: string; en: string }> = {
  'vet-clinic': { fr: 'Cliniques', en: 'Clinics' },
  'vet-lab': { fr: 'Laboratoires', en: 'Laboratories' },
  'vet-pharmacy': { fr: 'Pharmacies', en: 'Pharmacies' },
  'emergency': { fr: 'Urgences', en: 'Emergency' },
  'vet-school': { fr: 'Écoles', en: 'Schools' },
  'vet-directorate': { fr: 'Services officiels', en: 'Officials' },
};

export function QuickLinksSection({ lang, t, className }: QuickLinksSectionProps) {
  return (
    <section className={cn('py-16 px-4 md:px-[5%] bg-gradient-to-b from-oh-background to-white', className)}>
      <div className="container mx-auto">
        {/* Section Header */}
        <AnimatedSection animation="fadeInUp" className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-av-orange-100 text-av-orange-600 text-sm font-semibold mb-4">
            <Stethoscope size={16} />
            VET LINK
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-av-dark-900 mb-4">
            {lang === 'fr' ? 'Annuaire Vétérinaire' : 'Veterinary Directory'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {lang === 'fr'
              ? 'Trouvez rapidement les services vétérinaires dont vous avez besoin'
              : 'Quickly find the veterinary services you need'}
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Quick Search Box */}
          <AnimatedSection animation="fadeInLeft" className="lg:col-span-5">
            <div className="glass-card-solid h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-av-green-500 to-av-green-600">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-av-dark-900">
                    {lang === 'fr' ? 'Recherche rapide' : 'Quick Search'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {lang === 'fr' ? 'Trouvez un établissement' : 'Find an establishment'}
                  </p>
                </div>
              </div>

              {/* Search Form */}
              <form action={`/${lang}/vet-link`} method="GET" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'fr' ? 'Type d\'établissement' : 'Type of establishment'}
                  </label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-av-green-500 focus:ring-2 focus:ring-av-green-500/20 transition-all"
                  >
                    <option value="">{lang === 'fr' ? 'Tous les types' : 'All types'}</option>
                    {vetCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {categoryLabels[cat.id][lang]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'fr' ? 'Localisation' : 'Location'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      placeholder={lang === 'fr' ? 'Ville, région...' : 'City, region...'}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-av-green-500 focus:ring-2 focus:ring-av-green-500/20 transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-av-green-500 to-av-green-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-av-green-600 hover:to-av-green-700 transition-all shadow-lg shadow-av-green-500/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Search size={18} />
                  {lang === 'fr' ? 'Rechercher' : 'Search'}
                </motion.button>
              </form>

              {/* Emergency Hotline */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <a
                  href={`/${lang}/vet-link?category=emergency`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-red-500 text-white animate-pulse">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">
                      {lang === 'fr' ? 'Urgence Vétérinaire' : 'Veterinary Emergency'}
                    </p>
                    <p className="text-sm text-red-500">
                      {lang === 'fr' ? 'Services disponibles 24h/24' : '24/7 available services'}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto text-red-400 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Category Grid */}
          <AnimatedSection animation="fadeInRight" className="lg:col-span-7">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {vetCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <AnimatedItem key={category.id}>
                    <motion.a
                      href={`/${lang}/vet-link?category=${category.id}`}
                      className="block glass-card-solid text-center group"
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={cn(
                          'w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center',
                          'bg-gradient-to-br shadow-lg transition-all duration-300',
                          category.color,
                          'group-hover:scale-110 group-hover:shadow-xl'
                        )}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-av-dark-900 mb-1">
                        {categoryLabels[category.id][lang]}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {lang === 'fr' ? 'Voir la liste' : 'View list'}
                      </p>
                    </motion.a>
                  </AnimatedItem>
                );
              })}
            </motion.div>

            {/* Map Preview Placeholder */}
            <motion.div
              className="mt-6 rounded-2xl overflow-hidden relative h-48 bg-gradient-to-br from-av-blue-100 to-av-green-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-av-green-500 mx-auto mb-2 animate-bounce-subtle" />
                  <p className="font-semibold text-av-dark-800">
                    {lang === 'fr' ? 'Carte Interactive' : 'Interactive Map'}
                  </p>
                  <a
                    href={`/${lang}/vet-link`}
                    className="inline-flex items-center gap-2 mt-2 text-sm text-av-green-600 hover:text-av-green-700 font-medium"
                  >
                    {lang === 'fr' ? 'Explorer la carte' : 'Explore map'}
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              {/* Decorative map dots */}
              <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-av-green-500"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Briefcase, FileText, TrendingUp, MapPin, Clock, Building,
  ArrowRight, ChevronLeft, ChevronRight, DollarSign, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

interface Opportunity {
  id: number;
  title: string;
  slug: string;
  opportunity_type: 'job' | 'tender' | 'market';
  organization_name?: string;
  organization_logo?: string;
  country?: string;
  region?: string;
  deadline?: string;
  salary_range?: string;
  budget_estimate?: string;
  is_featured?: boolean;
  job_type?: string;
}

interface OpportunitiesCarouselProps {
  opportunities: Opportunity[];
  lang: Language;
  t: Translation;
  className?: string;
}

const typeConfig = {
  job: {
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-500',
    label: { fr: 'Emploi', en: 'Job' },
  },
  tender: {
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    badgeColor: 'bg-purple-500',
    label: { fr: 'Appel d\'offres', en: 'Tender' },
  },
  market: {
    icon: TrendingUp,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-500',
    label: { fr: 'Marché', en: 'Market' },
  },
};

export function OpportunitiesCarousel({
  opportunities,
  lang,
  t,
  className,
}: OpportunitiesCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [opportunities]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 400;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <section className={cn('relative py-16 overflow-hidden', className)}>
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-av-dark-900 via-av-dark-800 to-av-green-900"
        style={{ y: backgroundY }}
      />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-av-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-av-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 md:px-[5%]">
        {/* Section Header */}
        <AnimatedSection animation="fadeInUp" className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-av-green-400 text-sm font-semibold mb-4">
                <Briefcase size={16} />
                {lang === 'fr' ? 'OPPORTUNITÉS' : 'OPPORTUNITIES'}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                {lang === 'fr' ? 'Emplois & Marchés' : 'Jobs & Markets'}
              </h2>
              <p className="text-white/70 max-w-xl">
                {lang === 'fr'
                  ? 'Découvrez les dernières opportunités professionnelles'
                  : 'Discover the latest professional opportunities'}
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                  'bg-white/10 backdrop-blur-sm border border-white/20',
                  canScrollLeft
                    ? 'text-white hover:bg-white/20'
                    : 'text-white/30 cursor-not-allowed'
                )}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                  'bg-white/10 backdrop-blur-sm border border-white/20',
                  canScrollRight
                    ? 'text-white hover:bg-white/20'
                    : 'text-white/30 cursor-not-allowed'
                )}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide scroll-smooth"
        >
          {opportunities.map((opp, index) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              lang={lang}
              index={index}
            />
          ))}

          {/* View All Card */}
          <motion.a
            href={`/${lang}/opportunities`}
            className="flex-shrink-0 w-72 glass-card flex flex-col items-center justify-center text-center group"
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-semibold mb-1">
              {lang === 'fr' ? 'Voir toutes les opportunités' : 'View all opportunities'}
            </p>
            <p className="text-white/60 text-sm">
              {lang === 'fr' ? 'Plus de 50 offres' : 'More than 50 offers'}
            </p>
          </motion.a>
        </div>

        {/* Type Filter Pills */}
        <AnimatedSection animation="fadeInUp" className="mt-8 flex flex-wrap justify-center gap-3">
          {Object.entries(typeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <a
                key={type}
                href={`/${lang}/opportunities?type=${type}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
              >
                <Icon size={16} />
                {config.label[lang]}
              </a>
            );
          })}
        </AnimatedSection>
      </div>
    </section>
  );
}

// Individual Opportunity Card
interface OpportunityCardProps {
  opportunity: Opportunity;
  lang: Language;
  index: number;
}

function OpportunityCard({ opportunity, lang, index }: OpportunityCardProps) {
  const config = typeConfig[opportunity.opportunity_type];
  const Icon = config.icon;

  const daysRemaining = opportunity.deadline
    ? Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.a
      href={`/${lang}/opportunities/${opportunity.slug}`}
      className="flex-shrink-0 w-80 glass-card group"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br text-white',
          config.color
        )}>
          <Icon size={24} />
        </div>
        {opportunity.is_featured && (
          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-av-orange-500 text-white">
            Featured
          </span>
        )}
      </div>

      {/* Type Badge */}
      <span className={cn(
        'inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2',
        config.bgColor,
        config.textColor
      )}>
        {config.label[lang]}
      </span>

      {/* Title */}
      <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-av-green-400 transition-colors">
        {opportunity.title}
      </h3>

      {/* Organization */}
      {opportunity.organization_name && (
        <p className="flex items-center gap-2 text-sm text-white/70 mb-3">
          <Building size={14} />
          {opportunity.organization_name}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 text-xs text-white/60 mb-4">
        {opportunity.country && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {opportunity.country}
            {opportunity.region && `, ${opportunity.region}`}
          </span>
        )}
        {opportunity.job_type && (
          <span className="flex items-center gap-1">
            <Users size={12} />
            {opportunity.job_type}
          </span>
        )}
      </div>

      {/* Salary/Budget */}
      {(opportunity.salary_range || opportunity.budget_estimate) && (
        <div className="flex items-center gap-2 text-av-green-400 font-semibold mb-4">
          <DollarSign size={16} />
          {opportunity.salary_range || opportunity.budget_estimate}
        </div>
      )}

      {/* Deadline */}
      {daysRemaining !== null && (
        <div className={cn(
          'flex items-center gap-2 text-sm',
          daysRemaining <= 3 ? 'text-red-400' : daysRemaining <= 7 ? 'text-orange-400' : 'text-white/60'
        )}>
          <Clock size={14} />
          {daysRemaining > 0 ? (
            <>
              {daysRemaining} {lang === 'fr' ? 'jours restants' : 'days remaining'}
            </>
          ) : (
            <span className="text-red-400">{lang === 'fr' ? 'Expiré' : 'Expired'}</span>
          )}
        </div>
      )}

      {/* Hover Arrow */}
      <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
        <ArrowRight size={18} className="text-white" />
      </div>
    </motion.a>
  );
}

// Compact Opportunities List (for sidebar)
interface CompactOpportunitiesProps {
  opportunities: Opportunity[];
  lang: Language;
  title?: string;
  className?: string;
}

export function CompactOpportunities({
  opportunities,
  lang,
  title,
  className,
}: CompactOpportunitiesProps) {
  return (
    <div className={cn('glass-card-solid', className)}>
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <Briefcase className="w-5 h-5 text-av-green-600" />
          <h3 className="font-bold text-lg text-av-dark-900">{title}</h3>
        </div>
      )}

      <div className="space-y-3">
        {opportunities.slice(0, 5).map((opp) => {
          const config = typeConfig[opp.opportunity_type];
          return (
            <a
              key={opp.id}
              href={`/${lang}/opportunities/${opp.slug}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className={cn(
                'flex-shrink-0 w-2 h-2 rounded-full mt-2',
                config.badgeColor
              )} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-av-dark-900 line-clamp-1 group-hover:text-av-green-600 transition-colors">
                  {opp.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {config.label[lang]}
                  {opp.organization_name && ` • ${opp.organization_name}`}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <a
        href={`/${lang}/opportunities`}
        className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-av-green-600 hover:text-av-green-700 transition-colors"
      >
        {lang === 'fr' ? 'Toutes les opportunités' : 'All opportunities'}
        <ArrowRight size={14} />
      </a>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Newspaper, GraduationCap, Search, Briefcase, Users,
  ArrowRight, Sparkles
} from 'lucide-react';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';

interface FivePillarsSectionProps {
  lang: Language;
  t: Translation;
}

interface PillarCardData {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  gradient: string;
  iconBg: string;
  accentColor: string;
  number: string;
}

export function FivePillarsSection({ lang, t }: FivePillarsSectionProps) {
  const pillars: PillarCardData[] = [
    {
      id: 'get-informed',
      icon: Newspaper,
      title: t.fivePillars.getInformed.title,
      subtitle: lang === 'fr' ? "S'INFORMER" : 'GET INFORMED',
      description: t.fivePillars.getInformed.description,
      href: `/${lang}/news`,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      iconBg: 'bg-blue-500',
      accentColor: 'blue',
      number: '01',
    },
    {
      id: 'get-trained',
      icon: GraduationCap,
      title: t.fivePillars.getTrained.title,
      subtitle: 'VET E-LEARNING',
      description: t.fivePillars.getTrained.description,
      href: `/${lang}/vet-elearning`,
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      iconBg: 'bg-emerald-500',
      accentColor: 'emerald',
      number: '02',
    },
    {
      id: 'find',
      icon: Search,
      title: t.fivePillars.find.title,
      subtitle: 'VET LINK',
      description: t.fivePillars.find.description,
      href: `/${lang}/vet-link`,
      gradient: 'from-orange-500 via-orange-600 to-amber-600',
      iconBg: 'bg-orange-500',
      accentColor: 'orange',
      number: '03',
    },
    {
      id: 'opportunities',
      icon: Briefcase,
      title: t.fivePillars.opportunities.title,
      subtitle: lang === 'fr' ? 'OPPORTUNITÉS' : 'OPPORTUNITIES',
      description: t.fivePillars.opportunities.description,
      href: `/${lang}/opportunities`,
      gradient: 'from-amber-400 via-yellow-500 to-orange-400',
      iconBg: 'bg-amber-500',
      accentColor: 'amber',
      number: '04',
    },
    {
      id: 'coordinate',
      icon: Users,
      title: t.fivePillars.coordinate.title,
      subtitle: 'VET ALERT',
      description: t.fivePillars.coordinate.description,
      href: `/${lang}/vet-alert`,
      gradient: 'from-rose-500 via-red-600 to-pink-600',
      iconBg: 'bg-rose-500',
      accentColor: 'rose',
      number: '05',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="relative py-20 px-[5%] overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-green-200/30 to-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-purple-200/30 to-pink-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-100/20 via-transparent to-violet-100/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-200/50 text-green-700 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <Sparkles size={16} className="text-green-500" />
            {lang === 'fr' ? 'Découvrez notre écosystème' : 'Discover our ecosystem'}
          </div>

          {/* Title with gradient */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-slate-800">{lang === 'fr' ? 'Les ' : 'The '}</span>
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">5 {lang === 'fr' ? 'Piliers' : 'Pillars'}</span>
            <span className="text-slate-800"> AfricaVet</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {lang === 'fr'
              ? 'Une plateforme intégrée au service de la médecine vétérinaire africaine'
              : 'An integrated platform serving African veterinary medicine'}
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent to-green-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <div className="w-12 h-1 bg-gradient-to-l from-transparent to-green-500 rounded-full" />
          </div>
        </motion.div>

        {/* 5 Pillars Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5"
        >
          {pillars.map((pillar, index) => (
            <motion.div key={pillar.id} variants={cardVariants}>
              <Link
                href={pillar.href}
                className="group relative block h-full"
              >
                {/* Card */}
                <div className="relative h-full bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-2 hover:border-slate-300/80">

                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-out" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Number badge */}
                    <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white/80 transition-colors duration-300">
                        {pillar.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${pillar.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl transition-all duration-300`}>
                      <pillar.icon size={30} className="text-white" strokeWidth={1.5} />
                    </div>

                    {/* Subtitle Badge */}
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 group-hover:bg-white/20 mb-3 transition-colors duration-300">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 group-hover:text-white transition-colors duration-300">
                        {pillar.subtitle}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-white mb-3 transition-colors duration-300">
                      {pillar.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-500 group-hover:text-white/80 leading-relaxed mb-5 line-clamp-3 transition-colors duration-300">
                      {pillar.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 group-hover:text-white transition-colors duration-300">
                      <span>{lang === 'fr' ? 'Découvrir' : 'Discover'}</span>
                      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 mb-4">
            {lang === 'fr'
              ? 'Rejoignez la communauté vétérinaire africaine'
              : 'Join the African veterinary community'}
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            <span>{lang === 'fr' ? 'Commencer maintenant' : 'Get started now'}</span>
            <ArrowRight size={18} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

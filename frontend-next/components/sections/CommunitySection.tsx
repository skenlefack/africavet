'use client';

import { motion } from 'framer-motion';
import { Mail, Send, Briefcase, Handshake, MessageSquare, Bell } from 'lucide-react';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CommunitySectionProps {
  lang: Language;
  className?: string;
}

export function CommunitySection({ lang, className }: CommunitySectionProps) {
  const actions = [
    {
      icon: Bell,
      title: lang === 'fr' ? 'Newsletter' : 'Newsletter',
      description: lang === 'fr'
        ? 'Recevez les dernières actualités et opportunités par email'
        : 'Get the latest news and opportunities by email',
      href: `/${lang}/newsletter`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Send,
      title: lang === 'fr' ? 'Soumettre une information' : 'Submit News',
      description: lang === 'fr'
        ? 'Partagez une actualité, un communiqué ou un événement'
        : 'Share news, a press release, or an event',
      href: `/${lang}/contact`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      icon: Briefcase,
      title: lang === 'fr' ? 'Publier une opportunité' : 'Post an Opportunity',
      description: lang === 'fr'
        ? 'Diffusez vos offres d\'emploi, appels d\'offres ou marchés'
        : 'Publish your job offers, tenders, or market opportunities',
      href: `/${lang}/opportunities/submit`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      icon: Handshake,
      title: lang === 'fr' ? 'Devenir partenaire' : 'Become a Partner',
      description: lang === 'fr'
        ? 'Rejoignez le réseau AfricaVET et donnez de la visibilité à votre organisation'
        : 'Join the AfricaVET network and give visibility to your organization',
      href: `/${lang}/contact`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: MessageSquare,
      title: lang === 'fr' ? 'Contacter la rédaction' : 'Contact the Editorial Team',
      description: lang === 'fr'
        ? 'Questions, suggestions ou signalement de contenu'
        : 'Questions, suggestions, or content reporting',
      href: `/${lang}/contact`,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <section className={cn('py-16 px-4 md:px-[5%]', className)}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-rose-50 text-sm font-semibold text-purple-700 mb-3">
            <Mail size={16} />
            {lang === 'fr' ? 'Participez' : 'Get Involved'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === 'fr' ? 'Rejoignez la communauté AfricaVET' : 'Join the AfricaVET Community'}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {lang === 'fr'
              ? 'Contribuez à la diffusion de l\'information vétérinaire en Afrique'
              : 'Contribute to veterinary information dissemination in Africa'}
          </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {actions.map((action, index) => (
            <motion.a
              key={action.title}
              href={action.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group block"
            >
              <div className={cn(
                'relative rounded-2xl border border-gray-100 p-5 h-full',
                'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
                'overflow-hidden'
              )}>
                {/* Top gradient bar */}
                <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity', action.gradient)} />

                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', action.bgColor)}>
                  <action.icon size={22} className={action.color} />
                </div>

                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">
                  {action.title}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

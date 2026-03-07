'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle, MapPin, Calendar, Eye, ArrowRight,
  AlertCircle, Bell, Shield, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { Translation } from '@/lib/translations';
import { AnimatedSection, AnimatedItem, staggerContainer } from '@/components/ui/AnimatedSection';

interface Alert {
  id: number;
  code: string;
  title: string;
  slug?: string;
  alert_type: 'disease_outbreak' | 'emergency' | 'vaccination_campaign' | 'other';
  country?: string;
  region?: string;
  disease_name?: string;
  species?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'resolved';
  created_at?: string;
  affected_count?: number;
}

interface AlertsSectionProps {
  alerts: Alert[];
  lang: Language;
  t: Translation;
  className?: string;
}

const priorityConfig = {
  critical: {
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    label: { fr: 'Critique', en: 'Critical' },
    pulse: true,
  },
  high: {
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: { fr: 'Élevé', en: 'High' },
    pulse: false,
  },
  medium: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: { fr: 'Moyen', en: 'Medium' },
    pulse: false,
  },
  low: {
    color: 'bg-green-500',
    textColor: 'text-green-500',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-200',
    label: { fr: 'Faible', en: 'Low' },
    pulse: false,
  },
};

const alertTypeConfig = {
  disease_outbreak: {
    icon: AlertTriangle,
    label: { fr: 'Foyer de maladie', en: 'Disease Outbreak' },
  },
  emergency: {
    icon: AlertCircle,
    label: { fr: 'Urgence', en: 'Emergency' },
  },
  vaccination_campaign: {
    icon: Shield,
    label: { fr: 'Campagne de vaccination', en: 'Vaccination Campaign' },
  },
  other: {
    icon: Bell,
    label: { fr: 'Autre', en: 'Other' },
  },
};

export function AlertsSection({ alerts, lang, t, className }: AlertsSectionProps) {
  const activeAlerts = alerts.filter((a) => a.status === 'approved');

  if (!activeAlerts || activeAlerts.length === 0) {
    return null;
  }

  // Sort by priority
  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const criticalCount = activeAlerts.filter((a) => a.priority === 'critical').length;
  const highCount = activeAlerts.filter((a) => a.priority === 'high').length;

  return (
    <section className={cn('py-16 px-4 md:px-[5%]', className)}>
      <div className="container mx-auto">
        {/* Section Header */}
        <AnimatedSection animation="fadeInUp" className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-semibold mb-4">
                <AlertTriangle size={16} className={criticalCount > 0 ? 'animate-pulse' : ''} />
                VET ALERT
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-av-dark-900 mb-2">
                {lang === 'fr' ? 'Alertes Sanitaires' : 'Health Alerts'}
              </h2>
              <p className="text-gray-600">
                {lang === 'fr'
                  ? 'Surveillance en temps réel des événements sanitaires'
                  : 'Real-time monitoring of health events'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              {criticalCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="font-bold text-red-600">{criticalCount}</span>
                  <span className="text-sm text-red-600">
                    {lang === 'fr' ? 'Critiques' : 'Critical'}
                  </span>
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-100">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="font-bold text-orange-600">{highCount}</span>
                  <span className="text-sm text-orange-600">
                    {lang === 'fr' ? 'Élevées' : 'High'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Alerts Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {sortedAlerts.slice(0, 6).map((alert) => (
            <AlertCard key={alert.id} alert={alert} lang={lang} />
          ))}
        </motion.div>

        {/* Action Buttons */}
        <AnimatedSection animation="fadeInUp" className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a
            href={`/${lang}/vet-alert`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-av-dark-900 text-white font-semibold hover:bg-av-dark-800 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye size={18} />
            {lang === 'fr' ? 'Voir toutes les alertes' : 'View all alerts'}
            <ArrowRight size={18} />
          </motion.a>

          <motion.a
            href={`/${lang}/vet-alert/submit`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Bell size={18} />
            {lang === 'fr' ? 'Signaler une alerte' : 'Report an alert'}
          </motion.a>
        </AnimatedSection>
      </div>
    </section>
  );
}

// Individual Alert Card
interface AlertCardProps {
  alert: Alert;
  lang: Language;
}

function AlertCard({ alert, lang }: AlertCardProps) {
  const priority = priorityConfig[alert.priority];
  const type = alertTypeConfig[alert.alert_type] || alertTypeConfig.other;
  const Icon = type.icon;

  return (
    <AnimatedItem>
      <motion.a
        href={`/${lang}/vet-alert/${alert.id}`}
        className={cn(
          'block glass-card-solid border-l-4 group relative overflow-hidden',
          priority.borderColor
        )}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Priority pulse for critical */}
        {priority.pulse && (
          <div className="absolute top-0 right-0 w-20 h-20 -translate-y-10 translate-x-10">
            <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2 rounded-lg', priority.bgLight)}>
            <Icon className={cn('w-5 h-5', priority.textColor)} />
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white',
              priority.color,
              priority.pulse && 'animate-pulse'
            )}>
              {priority.label[lang]}
            </span>
          </div>
        </div>

        {/* Alert Code */}
        <span className="text-xs text-gray-500 font-mono">{alert.code}</span>

        {/* Title */}
        <h3 className="font-bold text-av-dark-900 mt-1 mb-2 line-clamp-2 group-hover:text-av-green-600 transition-colors">
          {alert.title}
        </h3>

        {/* Type */}
        <p className={cn('text-sm font-medium mb-3', priority.textColor)}>
          {type.label[lang]}
        </p>

        {/* Disease & Species */}
        {(alert.disease_name || alert.species) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {alert.disease_name && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-700">
                <Activity size={12} />
                {alert.disease_name}
              </span>
            )}
            {alert.species && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-700">
                {alert.species}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {(alert.country || alert.region) && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {alert.region && `${alert.region}, `}
              {alert.country}
            </span>
          )}
          {alert.created_at && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(alert.created_at).toLocaleDateString(
                lang === 'fr' ? 'fr-FR' : 'en-US',
                { day: 'numeric', month: 'short' }
              )}
            </span>
          )}
        </div>

        {/* Affected Count */}
        {alert.affected_count && alert.affected_count > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm">
              <span className="font-bold text-red-600">{alert.affected_count}</span>
              <span className="text-gray-500 ml-1">
                {lang === 'fr' ? 'cas signalés' : 'reported cases'}
              </span>
            </p>
          </div>
        )}
      </motion.a>
    </AnimatedItem>
  );
}

// Compact Alert List (for sidebar)
interface CompactAlertsProps {
  alerts: Alert[];
  lang: Language;
  title?: string;
  className?: string;
}

export function CompactAlerts({ alerts, lang, title, className }: CompactAlertsProps) {
  return (
    <div className={cn('glass-card-solid', className)}>
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-lg text-av-dark-900">{title}</h3>
        </div>
      )}

      <div className="space-y-3">
        {alerts.slice(0, 4).map((alert) => {
          const priority = priorityConfig[alert.priority];
          return (
            <a
              key={alert.id}
              href={`/${lang}/vet-alert/${alert.id}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className={cn(
                'flex-shrink-0 w-2 h-2 rounded-full mt-2',
                priority.color,
                priority.pulse && 'animate-pulse'
              )} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-av-dark-900 line-clamp-1 group-hover:text-av-green-600 transition-colors">
                  {alert.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {alert.region || alert.country}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <a
        href={`/${lang}/vet-alert`}
        className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
      >
        {lang === 'fr' ? 'Toutes les alertes' : 'All alerts'}
        <ArrowRight size={14} />
      </a>
    </div>
  );
}

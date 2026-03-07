'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle, Bell, MapPin, Calendar, ArrowLeft, Loader2,
  Shield, Clock, Users, Activity, Phone, Mail, Building,
  ChevronLeft, ChevronRight, X, Share2, Eye
} from 'lucide-react';
import { Language } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

interface VetAlertDetail {
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
  location_details?: string;
  latitude?: number;
  longitude?: number;
  species?: string;
  disease_name?: string;
  symptoms?: string;
  affected_count: number;
  dead_count: number;
  suspected_cause?: string;
  status: string;
  priority: string;
  reporter_name?: string;
  reporter_organization?: string;
  is_anonymous: boolean;
  validated_at?: string;
  validation_notes?: string;
  resolved_at?: string;
  resolution_notes?: string;
  actions_taken?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  photos: Array<{
    id: number;
    file_path: string;
    caption?: string;
  }>;
}

interface PageProps {
  params: { lang: string; id: string };
}

const ALERT_TYPE_LABELS = {
  disease_outbreak: { fr: 'Foyer de maladie', en: 'Disease Outbreak' },
  emergency: { fr: 'Urgence', en: 'Emergency' },
  vaccination_campaign: { fr: 'Campagne de vaccination', en: 'Vaccination Campaign' },
  food_safety: { fr: 'Sécurité alimentaire', en: 'Food Safety' },
  wildlife: { fr: 'Faune sauvage', en: 'Wildlife' },
  other: { fr: 'Autre', en: 'Other' },
};

const PRIORITY_CONFIG = {
  critical: { color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', label_fr: 'Critique', label_en: 'Critical' },
  high: { color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', label_fr: 'Élevée', label_en: 'High' },
  medium: { color: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', label_fr: 'Moyenne', label_en: 'Medium' },
  low: { color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', label_fr: 'Faible', label_en: 'Low' },
};

const STATUS_CONFIG = {
  pending: { color: 'bg-gray-500', label_fr: 'En attente', label_en: 'Pending' },
  approved: { color: 'bg-blue-500', label_fr: 'Approuvée', label_en: 'Approved' },
  investigating: { color: 'bg-purple-500', label_fr: 'En investigation', label_en: 'Investigating' },
  resolved: { color: 'bg-green-500', label_fr: 'Résolue', label_en: 'Resolved' },
  rejected: { color: 'bg-red-500', label_fr: 'Rejetée', label_en: 'Rejected' },
};

export default function AlertDetailPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;
  const alertId = params.id;

  const [alert, setAlert] = useState<VetAlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const t = {
    back: lang === 'fr' ? 'Retour aux alertes' : 'Back to alerts',
    loading: lang === 'fr' ? 'Chargement...' : 'Loading...',
    notFound: lang === 'fr' ? 'Alerte non trouvée' : 'Alert not found',
    alertInfo: lang === 'fr' ? 'Informations sur l\'alerte' : 'Alert Information',
    location: lang === 'fr' ? 'Localisation' : 'Location',
    healthInfo: lang === 'fr' ? 'Informations sanitaires' : 'Health Information',
    species: lang === 'fr' ? 'Espèces concernées' : 'Affected Species',
    disease: lang === 'fr' ? 'Maladie' : 'Disease',
    symptoms: lang === 'fr' ? 'Symptômes' : 'Symptoms',
    affected: lang === 'fr' ? 'animaux affectés' : 'animals affected',
    deaths: lang === 'fr' ? 'morts' : 'deaths',
    suspectedCause: lang === 'fr' ? 'Cause suspectée' : 'Suspected Cause',
    reporter: lang === 'fr' ? 'Rapporteur' : 'Reporter',
    anonymous: lang === 'fr' ? 'Anonyme' : 'Anonymous',
    status: lang === 'fr' ? 'Statut' : 'Status',
    priority: lang === 'fr' ? 'Priorité' : 'Priority',
    type: lang === 'fr' ? 'Type' : 'Type',
    validatedOn: lang === 'fr' ? 'Validée le' : 'Validated on',
    resolvedOn: lang === 'fr' ? 'Résolue le' : 'Resolved on',
    validationNotes: lang === 'fr' ? 'Notes de validation' : 'Validation Notes',
    resolutionNotes: lang === 'fr' ? 'Notes de résolution' : 'Resolution Notes',
    actionsTaken: lang === 'fr' ? 'Actions prises' : 'Actions Taken',
    photos: lang === 'fr' ? 'Photos' : 'Photos',
    views: lang === 'fr' ? 'vues' : 'views',
    share: lang === 'fr' ? 'Partager' : 'Share',
    reportedOn: lang === 'fr' ? 'Signalée le' : 'Reported on',
  };

  useEffect(() => {
    fetchAlert();
  }, [alertId]);

  const fetchAlert = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vet-alerts/${alertId}`);
      const data = await res.json();

      if (data.success) {
        setAlert(data.data);
      } else {
        setError(data.message || 'Alert not found');
      }
    } catch (err) {
      setError('Failed to load alert');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  };

  const getAlertTypeLabel = (type: string) => {
    const labels = ALERT_TYPE_LABELS[type as keyof typeof ALERT_TYPE_LABELS];
    return labels ? (lang === 'fr' ? labels.fr : labels.en) : type;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: alert?.title_fr || 'VET Alert',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const parseSpecies = (species: string | undefined): string[] => {
    if (!species) return [];
    try {
      return JSON.parse(species);
    } catch {
      return species.split(',').map(s => s.trim());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={32} className="animate-spin text-red-500" />
          <span className="text-gray-500">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-16 px-[5%]">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.notFound}</h1>
          <Link
            href={`/${lang}/vet-alert`}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <ArrowLeft size={20} />
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  const priority = getPriorityConfig(alert.priority);
  const status = getStatusConfig(alert.status);
  const speciesList = parseSpecies(alert.species);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className={cn('relative overflow-hidden text-white py-12 px-[5%]', priority.color.replace('bg-', 'bg-gradient-to-br from-') + ' via-red-700 to-orange-600')}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Link
            href={`/${lang}/vet-alert`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.back}
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={cn(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold',
                  'bg-white/20 text-white'
                )}>
                  <AlertTriangle size={14} />
                  {lang === 'fr' ? priority.label_fr : priority.label_en}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold',
                  'bg-white/20 text-white'
                )}>
                  {lang === 'fr' ? status.label_fr : status.label_en}
                </span>
                <span className="text-white/70 text-sm">{alert.code}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                {lang === 'en' && alert.title_en ? alert.title_en : alert.title_fr}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {alert.region || alert.country}
                  {alert.city && `, ${alert.city}`}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {t.reportedOn} {formatDate(alert.created_at, lang)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {alert.views_count} {t.views}
                </span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              title={t.share}
            >
              <Share2 size={20} />
            </button>
          </div>

          {/* Quick Stats */}
          {(alert.affected_count > 0 || alert.dead_count > 0) && (
            <div className="flex gap-4 mt-6">
              {alert.affected_count > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <span className="text-2xl font-bold">{alert.affected_count}</span>
                  <span className="text-sm text-white/70 ml-2">{t.affected}</span>
                </div>
              )}
              {alert.dead_count > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <span className="text-2xl font-bold">{alert.dead_count}</span>
                  <span className="text-sm text-white/70 ml-2">{t.deaths}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-[5%] py-8 space-y-6">
        {/* Description */}
        {(alert.description_fr || alert.description_en) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-gray-700 whitespace-pre-wrap">
              {lang === 'en' && alert.description_en ? alert.description_en : alert.description_fr}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Alert Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-red-500" />
              {t.alertInfo}
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">{t.type}</dt>
                <dd className="font-medium">{getAlertTypeLabel(alert.alert_type)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{t.priority}</dt>
                <dd>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                    priority.bg, priority.text
                  )}>
                    {lang === 'fr' ? priority.label_fr : priority.label_en}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{t.status}</dt>
                <dd>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white',
                    status.color
                  )}>
                    {lang === 'fr' ? status.label_fr : status.label_en}
                  </span>
                </dd>
              </div>
              {alert.disease_name && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t.disease}</dt>
                  <dd className="font-medium text-red-600">{alert.disease_name}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-red-500" />
              {t.location}
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-gray-500 text-sm">Pays</dt>
                <dd className="font-medium">{alert.country}</dd>
              </div>
              {alert.region && (
                <div>
                  <dt className="text-gray-500 text-sm">Région</dt>
                  <dd className="font-medium">{alert.region}</dd>
                </div>
              )}
              {alert.city && (
                <div>
                  <dt className="text-gray-500 text-sm">Ville</dt>
                  <dd className="font-medium">{alert.city}</dd>
                </div>
              )}
              {alert.location_details && (
                <div>
                  <dt className="text-gray-500 text-sm">Détails</dt>
                  <dd className="text-gray-700">{alert.location_details}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Health Information */}
        {(speciesList.length > 0 || alert.symptoms || alert.suspected_cause) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-red-500" />
              {t.healthInfo}
            </h2>

            {speciesList.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t.species}</h3>
                <div className="flex flex-wrap gap-2">
                  {speciesList.map((species, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium"
                    >
                      {species}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {alert.symptoms && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t.symptoms}</h3>
                <p className="text-gray-700">{alert.symptoms}</p>
              </div>
            )}

            {alert.suspected_cause && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t.suspectedCause}</h3>
                <p className="text-gray-700">{alert.suspected_cause}</p>
              </div>
            )}
          </div>
        )}

        {/* Reporter */}
        {!alert.is_anonymous && (alert.reporter_name || alert.reporter_organization) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-red-500" />
              {t.reporter}
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Users size={24} className="text-gray-400" />
              </div>
              <div>
                {alert.reporter_name && (
                  <p className="font-medium text-gray-900">{alert.reporter_name}</p>
                )}
                {alert.reporter_organization && (
                  <p className="text-gray-500 text-sm">{alert.reporter_organization}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {alert.is_anonymous && (
          <div className="bg-gray-50 rounded-2xl p-4 text-center text-gray-500">
            {t.reporter}: {t.anonymous}
          </div>
        )}

        {/* Validation & Resolution Notes */}
        {(alert.validation_notes || alert.resolution_notes || alert.actions_taken) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            {alert.validated_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t.validatedOn} {formatDate(alert.validated_at, lang)}
                </h3>
                {alert.validation_notes && (
                  <p className="text-gray-700 bg-blue-50 rounded-lg p-3">{alert.validation_notes}</p>
                )}
              </div>
            )}

            {alert.resolved_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t.resolvedOn} {formatDate(alert.resolved_at, lang)}
                </h3>
                {alert.resolution_notes && (
                  <p className="text-gray-700 bg-green-50 rounded-lg p-3">{alert.resolution_notes}</p>
                )}
              </div>
            )}

            {alert.actions_taken && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{t.actionsTaken}</h3>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{alert.actions_taken}</p>
              </div>
            )}
          </div>
        )}

        {/* Photos */}
        {alert.photos && alert.photos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={20} className="text-red-500" />
              {t.photos}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {alert.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={photo.file_path}
                    alt={photo.caption || `Photo ${index + 1}`}
                    fill
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && alert.photos && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <X size={24} />
          </button>

          {alert.photos.length > 1 && (
            <>
              <button
                onClick={() => setLightboxIndex(i => (i > 0 ? i - 1 : alert.photos!.length - 1))}
                className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() => setLightboxIndex(i => (i < alert.photos!.length - 1 ? i + 1 : 0))}
                className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] relative">
            <Image
              src={alert.photos[lightboxIndex].file_path}
              alt={alert.photos[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="max-h-[80vh] w-auto object-contain"
            />
            {alert.photos[lightboxIndex].caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 text-center">
                {alert.photos[lightboxIndex].caption}
              </p>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {alert.photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setLightboxIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === lightboxIndex ? 'bg-white w-4' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

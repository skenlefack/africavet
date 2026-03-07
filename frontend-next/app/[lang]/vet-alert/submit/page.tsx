'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, Bell, MapPin, Upload, X, Loader2,
  ArrowLeft, CheckCircle, User, Phone, Mail, Building
} from 'lucide-react';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PageProps {
  params: { lang: string };
}

const ALERT_TYPES = [
  { id: 'disease_outbreak', label_fr: 'Foyer de maladie', label_en: 'Disease Outbreak' },
  { id: 'emergency', label_fr: 'Urgence', label_en: 'Emergency' },
  { id: 'vaccination_campaign', label_fr: 'Campagne de vaccination', label_en: 'Vaccination Campaign' },
  { id: 'food_safety', label_fr: 'Sécurité alimentaire', label_en: 'Food Safety' },
  { id: 'wildlife', label_fr: 'Faune sauvage', label_en: 'Wildlife' },
  { id: 'other', label_fr: 'Autre', label_en: 'Other' },
];

const PRIORITY_OPTIONS = [
  { id: 'low', label_fr: 'Faible', label_en: 'Low', color: 'bg-green-500' },
  { id: 'medium', label_fr: 'Moyenne', label_en: 'Medium', color: 'bg-yellow-500' },
  { id: 'high', label_fr: 'Élevée', label_en: 'High', color: 'bg-orange-500' },
  { id: 'critical', label_fr: 'Critique', label_en: 'Critical', color: 'bg-red-500' },
];

const SPECIES_OPTIONS = [
  { id: 'cattle', label_fr: 'Bovins', label_en: 'Cattle' },
  { id: 'sheep', label_fr: 'Ovins', label_en: 'Sheep' },
  { id: 'goats', label_fr: 'Caprins', label_en: 'Goats' },
  { id: 'pigs', label_fr: 'Porcins', label_en: 'Pigs' },
  { id: 'poultry', label_fr: 'Volailles', label_en: 'Poultry' },
  { id: 'equine', label_fr: 'Équins', label_en: 'Equine' },
  { id: 'dogs', label_fr: 'Chiens', label_en: 'Dogs' },
  { id: 'cats', label_fr: 'Chats', label_en: 'Cats' },
  { id: 'wildlife', label_fr: 'Faune sauvage', label_en: 'Wildlife' },
  { id: 'fish', label_fr: 'Poissons', label_en: 'Fish' },
  { id: 'other', label_fr: 'Autre', label_en: 'Other' },
];

export default function SubmitAlertPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    alert_type: 'disease_outbreak',
    priority: 'medium',
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    country: 'Cameroun',
    region: '',
    city: '',
    location_details: '',
    species: [] as string[],
    disease_name: '',
    symptoms: '',
    affected_count: '',
    dead_count: '',
    suspected_cause: '',
    reporter_name: '',
    reporter_phone: '',
    reporter_email: '',
    reporter_organization: '',
    is_anonymous: false,
  });

  const t = {
    title: lang === 'fr' ? 'Signaler une alerte' : 'Report an Alert',
    subtitle: lang === 'fr' ? 'Signalez un problème sanitaire vétérinaire' : 'Report a veterinary health issue',
    back: lang === 'fr' ? 'Retour aux alertes' : 'Back to alerts',
    alertInfo: lang === 'fr' ? 'Informations sur l\'alerte' : 'Alert Information',
    alertType: lang === 'fr' ? 'Type d\'alerte' : 'Alert Type',
    priority: lang === 'fr' ? 'Priorité' : 'Priority',
    titleFr: lang === 'fr' ? 'Titre (Français)' : 'Title (French)',
    titleEn: lang === 'fr' ? 'Titre (Anglais)' : 'Title (English)',
    descriptionFr: lang === 'fr' ? 'Description (Français)' : 'Description (French)',
    descriptionEn: lang === 'fr' ? 'Description (Anglais)' : 'Description (English)',
    location: lang === 'fr' ? 'Localisation' : 'Location',
    country: lang === 'fr' ? 'Pays' : 'Country',
    region: lang === 'fr' ? 'Région' : 'Region',
    city: lang === 'fr' ? 'Ville' : 'City',
    locationDetails: lang === 'fr' ? 'Détails de localisation' : 'Location Details',
    healthInfo: lang === 'fr' ? 'Informations sanitaires' : 'Health Information',
    species: lang === 'fr' ? 'Espèces concernées' : 'Affected Species',
    diseaseName: lang === 'fr' ? 'Nom de la maladie (si connue)' : 'Disease Name (if known)',
    symptoms: lang === 'fr' ? 'Symptômes observés' : 'Observed Symptoms',
    affectedCount: lang === 'fr' ? 'Nombre d\'animaux affectés' : 'Number of Affected Animals',
    deadCount: lang === 'fr' ? 'Nombre de morts' : 'Number of Deaths',
    suspectedCause: lang === 'fr' ? 'Cause suspectée' : 'Suspected Cause',
    reporter: lang === 'fr' ? 'Informations du rapporteur' : 'Reporter Information',
    reporterName: lang === 'fr' ? 'Votre nom' : 'Your Name',
    reporterPhone: lang === 'fr' ? 'Téléphone' : 'Phone',
    reporterEmail: lang === 'fr' ? 'Email' : 'Email',
    reporterOrg: lang === 'fr' ? 'Organisation' : 'Organization',
    anonymous: lang === 'fr' ? 'Rester anonyme' : 'Stay Anonymous',
    photos: lang === 'fr' ? 'Photos (optionnel)' : 'Photos (optional)',
    addPhotos: lang === 'fr' ? 'Ajouter des photos' : 'Add Photos',
    maxPhotos: lang === 'fr' ? 'Maximum 5 photos' : 'Maximum 5 photos',
    submit: lang === 'fr' ? 'Soumettre l\'alerte' : 'Submit Alert',
    submitting: lang === 'fr' ? 'Envoi en cours...' : 'Submitting...',
    successTitle: lang === 'fr' ? 'Alerte soumise avec succès!' : 'Alert Submitted Successfully!',
    successMessage: lang === 'fr'
      ? 'Votre alerte a été envoyée et sera examinée par notre équipe. Vous serez notifié par email une fois approuvée.'
      : 'Your alert has been submitted and will be reviewed by our team. You will be notified by email once approved.',
    submitAnother: lang === 'fr' ? 'Soumettre une autre alerte' : 'Submit Another Alert',
    required: lang === 'fr' ? 'Requis' : 'Required',
    optional: lang === 'fr' ? 'Optionnel' : 'Optional',
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpeciesChange = (speciesId: string) => {
    setFormData(prev => ({
      ...prev,
      species: prev.species.includes(speciesId)
        ? prev.species.filter(s => s !== speciesId)
        : [...prev.species, speciesId]
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      alert(t.maxPhotos);
      return;
    }

    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);

    // Generate previews
    const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'species') {
          submitData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          submitData.append(key, value ? '1' : '0');
        } else {
          submitData.append(key, String(value));
        }
      });

      // Add photos
      photos.forEach(photo => {
        submitData.append('photos', photo);
      });

      const res = await fetch('/api/vet-alerts', {
        method: 'POST',
        body: submitData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to submit alert');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16 px-[5%]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.successTitle}</h1>
          <p className="text-gray-600 mb-8">{t.successMessage}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}/vet-alert`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all"
            >
              <Bell size={20} />
              {t.back}
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  alert_type: 'disease_outbreak',
                  priority: 'medium',
                  title_fr: '',
                  title_en: '',
                  description_fr: '',
                  description_en: '',
                  country: 'Cameroun',
                  region: '',
                  city: '',
                  location_details: '',
                  species: [],
                  disease_name: '',
                  symptoms: '',
                  affected_count: '',
                  dead_count: '',
                  suspected_cause: '',
                  reporter_name: '',
                  reporter_phone: '',
                  reporter_email: '',
                  reporter_organization: '',
                  is_anonymous: false,
                });
                setPhotos([]);
                setPhotoPreviews([]);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all"
            >
              <AlertTriangle size={20} />
              {t.submitAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-orange-600 text-white py-12 px-[5%]">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${lang}/vet-alert`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <AlertTriangle size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-red-100">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-[5%] py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Alert Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell size={24} className="text-red-500" />
              {t.alertInfo}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.alertType} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.alert_type}
                  onChange={(e) => handleChange('alert_type', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  {ALERT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {lang === 'fr' ? type.label_fr : type.label_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.priority} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleChange('priority', option.id)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2',
                        formData.priority === option.id
                          ? `${option.color} text-white border-transparent`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {lang === 'fr' ? option.label_fr : option.label_en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title FR */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.titleFr} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title_fr}
                  onChange={(e) => handleChange('title_fr', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Title EN */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.titleEn} <span className="text-gray-400">({t.optional})</span>
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => handleChange('title_en', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Description FR */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.descriptionFr} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description_fr}
                  onChange={(e) => handleChange('description_fr', e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Description EN */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.descriptionEn} <span className="text-gray-400">({t.optional})</span>
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => handleChange('description_en', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin size={24} className="text-red-500" />
              {t.location}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.country} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.region} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.city}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.locationDetails}
                </label>
                <input
                  type="text"
                  value={formData.location_details}
                  onChange={(e) => handleChange('location_details', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-500" />
              {t.healthInfo}
            </h2>

            <div className="space-y-6">
              {/* Species */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.species} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIES_OPTIONS.map(species => (
                    <button
                      key={species.id}
                      type="button"
                      onClick={() => handleSpeciesChange(species.id)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
                        formData.species.includes(species.id)
                          ? 'bg-red-500 text-white border-transparent'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300'
                      )}
                    >
                      {lang === 'fr' ? species.label_fr : species.label_en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.diseaseName}
                  </label>
                  <input
                    type="text"
                    value={formData.disease_name}
                    onChange={(e) => handleChange('disease_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.symptoms}
                  </label>
                  <input
                    type="text"
                    value={formData.symptoms}
                    onChange={(e) => handleChange('symptoms', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.affectedCount}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.affected_count}
                    onChange={(e) => handleChange('affected_count', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.deadCount}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dead_count}
                    onChange={(e) => handleChange('dead_count', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.suspectedCause}
                  </label>
                  <textarea
                    value={formData.suspected_cause}
                    onChange={(e) => handleChange('suspected_cause', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} className="text-red-500" />
              {t.reporter}
            </h2>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => handleChange('is_anonymous', e.target.checked)}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <span className="text-gray-700">{t.anonymous}</span>
              </label>
            </div>

            {!formData.is_anonymous && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    {t.reporterName}
                  </label>
                  <input
                    type="text"
                    value={formData.reporter_name}
                    onChange={(e) => handleChange('reporter_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    {t.reporterPhone}
                  </label>
                  <input
                    type="tel"
                    value={formData.reporter_phone}
                    onChange={(e) => handleChange('reporter_phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    {t.reporterEmail}
                  </label>
                  <input
                    type="email"
                    value={formData.reporter_email}
                    onChange={(e) => handleChange('reporter_email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building size={16} className="inline mr-1" />
                    {t.reporterOrg}
                  </label>
                  <input
                    type="text"
                    value={formData.reporter_organization}
                    onChange={(e) => handleChange('reporter_organization', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload size={24} className="text-red-500" />
              {t.photos}
            </h2>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover object-top rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {photos.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">{t.addPhotos}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">{t.maxPhotos}</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || formData.species.length === 0}
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <AlertTriangle size={20} />
                  {t.submit}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

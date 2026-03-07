'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, FileText, ShoppingBag, ArrowLeft, Loader2, MapPin,
  Calendar, Clock, DollarSign, Building, Globe, Phone, Mail,
  ExternalLink, Star, Zap, Users, Eye, Send, CheckCircle, X
} from 'lucide-react';
import { Language } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

interface OpportunityDetail {
  id: number;
  slug: string;
  opportunity_type: 'job' | 'tender' | 'market';
  title_fr: string;
  title_en?: string;
  description_fr?: string;
  description_en?: string;
  organization_id?: number;
  organization_name?: string;
  organization_logo?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  country: string;
  region?: string;
  city?: string;
  address?: string;
  is_remote: boolean;
  job_type?: string;
  experience_required?: string;
  education_required?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  skills_required?: string;
  benefits?: string;
  tender_reference?: string;
  tender_type?: string;
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string;
  submission_method?: string;
  eligibility_criteria?: string;
  required_documents?: string;
  market_category?: string;
  quantity?: string;
  unit_price?: number;
  start_date?: string;
  deadline?: string;
  is_featured: boolean;
  is_urgent: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  categories: Array<{ id: number; name_fr: string; name_en?: string; slug: string }>;
  org_name?: string;
  org_logo?: string;
  org_website?: string;
}

interface PageProps {
  params: { lang: string; id: string };
}

const JOB_TYPES = {
  full_time: { fr: 'Temps plein', en: 'Full-time' },
  part_time: { fr: 'Temps partiel', en: 'Part-time' },
  contract: { fr: 'Contrat', en: 'Contract' },
  internship: { fr: 'Stage', en: 'Internship' },
  volunteer: { fr: 'Bénévolat', en: 'Volunteer' },
  freelance: { fr: 'Freelance', en: 'Freelance' },
};

const SALARY_PERIODS = {
  hour: { fr: '/heure', en: '/hour' },
  day: { fr: '/jour', en: '/day' },
  month: { fr: '/mois', en: '/month' },
  year: { fr: '/an', en: '/year' },
  project: { fr: '/projet', en: '/project' },
};

export default function OpportunityDetailPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;
  const opportunityId = params.id;

  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  const [applicationForm, setApplicationForm] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    cover_letter: '',
    experience_years: '',
    current_position: '',
    availability_date: '',
  });

  const t = {
    back: lang === 'fr' ? 'Retour aux opportunités' : 'Back to opportunities',
    loading: lang === 'fr' ? 'Chargement...' : 'Loading...',
    notFound: lang === 'fr' ? 'Opportunité non trouvée' : 'Opportunity not found',
    apply: lang === 'fr' ? 'Postuler' : 'Apply',
    applyNow: lang === 'fr' ? 'Postuler maintenant' : 'Apply Now',
    applicationForm: lang === 'fr' ? 'Formulaire de candidature' : 'Application Form',
    yourName: lang === 'fr' ? 'Votre nom' : 'Your Name',
    yourEmail: lang === 'fr' ? 'Votre email' : 'Your Email',
    yourPhone: lang === 'fr' ? 'Votre téléphone' : 'Your Phone',
    coverLetter: lang === 'fr' ? 'Lettre de motivation' : 'Cover Letter',
    experienceYears: lang === 'fr' ? 'Années d\'expérience' : 'Years of Experience',
    currentPosition: lang === 'fr' ? 'Poste actuel' : 'Current Position',
    availabilityDate: lang === 'fr' ? 'Date de disponibilité' : 'Availability Date',
    submit: lang === 'fr' ? 'Envoyer la candidature' : 'Submit Application',
    submitting: lang === 'fr' ? 'Envoi...' : 'Submitting...',
    successTitle: lang === 'fr' ? 'Candidature envoyée!' : 'Application Submitted!',
    successMessage: lang === 'fr' ? 'Votre candidature a été envoyée avec succès.' : 'Your application has been submitted successfully.',
    close: lang === 'fr' ? 'Fermer' : 'Close',
    deadline: lang === 'fr' ? 'Date limite' : 'Deadline',
    salary: lang === 'fr' ? 'Salaire' : 'Salary',
    budget: lang === 'fr' ? 'Budget' : 'Budget',
    location: lang === 'fr' ? 'Localisation' : 'Location',
    remote: lang === 'fr' ? 'Télétravail possible' : 'Remote possible',
    featured: lang === 'fr' ? 'À la une' : 'Featured',
    urgent: lang === 'fr' ? 'Urgent' : 'Urgent',
    applications: lang === 'fr' ? 'candidatures' : 'applications',
    views: lang === 'fr' ? 'vues' : 'views',
    jobType: lang === 'fr' ? 'Type de contrat' : 'Contract Type',
    experience: lang === 'fr' ? 'Expérience requise' : 'Required Experience',
    education: lang === 'fr' ? 'Formation requise' : 'Required Education',
    skills: lang === 'fr' ? 'Compétences requises' : 'Required Skills',
    benefits: lang === 'fr' ? 'Avantages' : 'Benefits',
    tenderRef: lang === 'fr' ? 'Référence' : 'Reference',
    tenderType: lang === 'fr' ? 'Type d\'appel' : 'Tender Type',
    submissionMethod: lang === 'fr' ? 'Méthode de soumission' : 'Submission Method',
    eligibility: lang === 'fr' ? 'Critères d\'éligibilité' : 'Eligibility Criteria',
    requiredDocs: lang === 'fr' ? 'Documents requis' : 'Required Documents',
    contact: lang === 'fr' ? 'Contact' : 'Contact',
    postedOn: lang === 'fr' ? 'Publié le' : 'Posted on',
    description: lang === 'fr' ? 'Description' : 'Description',
  };

  useEffect(() => {
    fetchOpportunity();
  }, [opportunityId]);

  const fetchOpportunity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`);
      const data = await res.json();

      if (data.success) {
        setOpportunity(data.data);
      } else {
        setError(data.message || 'Opportunity not found');
      }
    } catch (err) {
      setError('Failed to load opportunity');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setApplyError('');

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationForm),
      });

      const data = await res.json();

      if (data.success) {
        setApplySuccess(true);
      } else {
        setApplyError(data.message || 'Failed to submit application');
      }
    } catch (err) {
      setApplyError('An error occurred');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'XAF', period?: string) => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat('fr-FR');
    const periodLabel = period ? (lang === 'fr' ? SALARY_PERIODS[period as keyof typeof SALARY_PERIODS]?.fr : SALARY_PERIODS[period as keyof typeof SALARY_PERIODS]?.en) || '' : '';

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)} ${currency}${periodLabel}`;
    }
    if (min) return `${formatter.format(min)}+ ${currency}${periodLabel}`;
    if (max) return `${lang === 'fr' ? 'Jusqu\'à' : 'Up to'} ${formatter.format(max)} ${currency}${periodLabel}`;
    return null;
  };

  const getJobTypeLabel = (type?: string) => {
    if (!type) return null;
    const labels = JOB_TYPES[type as keyof typeof JOB_TYPES];
    return labels ? (lang === 'fr' ? labels.fr : labels.en) : type;
  };

  const parseJSON = (str?: string): string[] => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return str.split(',').map(s => s.trim());
    }
  };

  const isDeadlinePassed = opportunity?.deadline && new Date(opportunity.deadline) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <span className="text-gray-500">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-[5%]">
        <div className="max-w-2xl mx-auto text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.notFound}</h1>
          <Link
            href={`/${lang}/opportunities`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={20} />
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = opportunity.opportunity_type === 'job' ? Briefcase :
                   opportunity.opportunity_type === 'tender' ? FileText : ShoppingBag;

  const typeColor = opportunity.opportunity_type === 'job' ? 'blue' :
                    opportunity.opportunity_type === 'tender' ? 'purple' : 'green';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className={cn(
        'relative overflow-hidden text-white py-12 px-[5%]',
        `bg-gradient-to-br from-${typeColor}-600 via-${typeColor}-700 to-indigo-600`
      )} style={{
        background: opportunity.opportunity_type === 'job' ? 'linear-gradient(135deg, #2563eb, #4f46e5)' :
                    opportunity.opportunity_type === 'tender' ? 'linear-gradient(135deg, #7c3aed, #6366f1)' :
                    'linear-gradient(135deg, #16a34a, #0d9488)'
      }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <Link
            href={`/${lang}/opportunities`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.back}
          </Link>

          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              {opportunity.organization_logo || opportunity.org_logo ? (
                <img
                  src={opportunity.organization_logo || opportunity.org_logo}
                  alt={opportunity.organization_name || ''}
                  className="w-full h-full object-cover object-top rounded-2xl"
                />
              ) : (
                <TypeIcon size={32} className="text-white" />
              )}
            </div>

            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {opportunity.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                    <Star size={14} />
                    {t.featured}
                  </span>
                )}
                {opportunity.is_urgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                    <Zap size={14} />
                    {t.urgent}
                  </span>
                )}
                {opportunity.is_remote && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-semibold">
                    <Globe size={14} />
                    {t.remote}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {lang === 'en' && opportunity.title_en ? opportunity.title_en : opportunity.title_fr}
              </h1>

              {(opportunity.organization_name || opportunity.org_name) && (
                <p className="flex items-center gap-2 text-white/80 mb-4">
                  <Building size={18} />
                  {opportunity.organization_name || opportunity.org_name}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {opportunity.region || opportunity.country}
                  {opportunity.city && `, ${opportunity.city}`}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {t.postedOn} {formatDate(opportunity.created_at, lang)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {opportunity.views_count} {t.views}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {opportunity.applications_count} {t.applications}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-[5%] py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {(opportunity.description_fr || opportunity.description_en) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{t.description}</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {lang === 'en' && opportunity.description_en ? opportunity.description_en : opportunity.description_fr}
                  </p>
                </div>
              </div>
            )}

            {/* Job-specific Info */}
            {opportunity.opportunity_type === 'job' && (
              <>
                {parseJSON(opportunity.skills_required).length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t.skills}</h2>
                    <div className="flex flex-wrap gap-2">
                      {parseJSON(opportunity.skills_required).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {parseJSON(opportunity.benefits).length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t.benefits}</h2>
                    <ul className="space-y-2">
                      {parseJSON(opportunity.benefits).map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle size={16} className="text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Tender-specific Info */}
            {opportunity.opportunity_type === 'tender' && (
              <>
                {opportunity.eligibility_criteria && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t.eligibility}</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{opportunity.eligibility_criteria}</p>
                  </div>
                )}

                {opportunity.submission_method && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t.submissionMethod}</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{opportunity.submission_method}</p>
                  </div>
                )}

                {parseJSON(opportunity.required_documents).length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t.requiredDocs}</h2>
                    <ul className="space-y-2">
                      {parseJSON(opportunity.required_documents).map((doc, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <FileText size={16} className="text-purple-500" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            {!isDeadlinePassed && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
              >
                <Send size={20} />
                {t.applyNow}
              </button>
            )}

            {/* Key Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              {opportunity.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Clock size={16} />
                    {t.deadline}
                  </span>
                  <span className={cn('font-semibold', isDeadlinePassed ? 'text-red-500' : 'text-gray-900')}>
                    {formatDate(opportunity.deadline, lang)}
                  </span>
                </div>
              )}

              {opportunity.opportunity_type === 'job' && (
                <>
                  {opportunity.job_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{t.jobType}</span>
                      <span className="font-semibold text-gray-900">{getJobTypeLabel(opportunity.job_type)}</span>
                    </div>
                  )}

                  {formatSalary(opportunity.salary_min, opportunity.salary_max, opportunity.salary_currency, opportunity.salary_period) && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2">
                        <DollarSign size={16} />
                        {t.salary}
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatSalary(opportunity.salary_min, opportunity.salary_max, opportunity.salary_currency, opportunity.salary_period)}
                      </span>
                    </div>
                  )}

                  {opportunity.experience_required && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{t.experience}</span>
                      <span className="font-semibold text-gray-900">{opportunity.experience_required}</span>
                    </div>
                  )}

                  {opportunity.education_required && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{t.education}</span>
                      <span className="font-semibold text-gray-900">{opportunity.education_required}</span>
                    </div>
                  )}
                </>
              )}

              {opportunity.opportunity_type === 'tender' && (
                <>
                  {opportunity.tender_reference && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">{t.tenderRef}</span>
                      <span className="font-semibold text-gray-900">{opportunity.tender_reference}</span>
                    </div>
                  )}

                  {formatSalary(opportunity.budget_min, opportunity.budget_max, opportunity.budget_currency) && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-2">
                        <DollarSign size={16} />
                        {t.budget}
                      </span>
                      <span className="font-semibold text-purple-600">
                        {formatSalary(opportunity.budget_min, opportunity.budget_max, opportunity.budget_currency)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Contact */}
            {(opportunity.contact_email || opportunity.contact_phone || opportunity.website_url) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">{t.contact}</h3>
                <div className="space-y-3">
                  {opportunity.contact_name && (
                    <p className="text-gray-700 font-medium">{opportunity.contact_name}</p>
                  )}
                  {opportunity.contact_email && (
                    <a
                      href={`mailto:${opportunity.contact_email}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Mail size={16} />
                      {opportunity.contact_email}
                    </a>
                  )}
                  {opportunity.contact_phone && (
                    <a
                      href={`tel:${opportunity.contact_phone}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Phone size={16} />
                      {opportunity.contact_phone}
                    </a>
                  )}
                  {(opportunity.website_url || opportunity.org_website) && (
                    <a
                      href={opportunity.website_url || opportunity.org_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink size={16} />
                      {lang === 'fr' ? 'Visiter le site' : 'Visit website'}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">{t.location}</h3>
              <div className="space-y-2 text-gray-700">
                <p>{opportunity.country}</p>
                {opportunity.region && <p>{opportunity.region}</p>}
                {opportunity.city && <p>{opportunity.city}</p>}
                {opportunity.address && <p className="text-sm text-gray-500">{opportunity.address}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {applySuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
                <p className="text-gray-600 mb-6">{t.successMessage}</p>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplySuccess(false);
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{t.applicationForm}</h3>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleApply} className="p-6 space-y-4">
                  {applyError && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                      {applyError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.yourName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicationForm.applicant_name}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.yourEmail} *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicationForm.applicant_email}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_email: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.yourPhone}
                    </label>
                    <input
                      type="tel"
                      value={applicationForm.applicant_phone}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.experienceYears}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={applicationForm.experience_years}
                        onChange={(e) => setApplicationForm(prev => ({ ...prev, experience_years: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.availabilityDate}
                      </label>
                      <input
                        type="date"
                        value={applicationForm.availability_date}
                        onChange={(e) => setApplicationForm(prev => ({ ...prev, availability_date: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.currentPosition}
                    </label>
                    <input
                      type="text"
                      value={applicationForm.current_position}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, current_position: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.coverLetter}
                    </label>
                    <textarea
                      rows={4}
                      value={applicationForm.cover_letter}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, cover_letter: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {applying ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {t.submitting}
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        {t.submit}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

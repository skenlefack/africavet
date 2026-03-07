'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase, FileText, ShoppingBag, ArrowLeft, Loader2,
  Building, MapPin, DollarSign, Calendar, CheckCircle, Upload
} from 'lucide-react';
import { Language } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name_fr: string;
  name_en?: string;
  slug: string;
  opportunity_type: string;
}

interface PageProps {
  params: { lang: string };
}

const OPPORTUNITY_TYPES = [
  { id: 'job', label_fr: 'Offre d\'emploi', label_en: 'Job Offer', icon: Briefcase, color: 'blue' },
  { id: 'tender', label_fr: 'Appel d\'offres', label_en: 'Tender', icon: FileText, color: 'purple' },
  { id: 'market', label_fr: 'Opportunité de marché', label_en: 'Market Opportunity', icon: ShoppingBag, color: 'green' },
];

const JOB_TYPES = [
  { id: 'full_time', label_fr: 'Temps plein', label_en: 'Full-time' },
  { id: 'part_time', label_fr: 'Temps partiel', label_en: 'Part-time' },
  { id: 'contract', label_fr: 'Contrat', label_en: 'Contract' },
  { id: 'internship', label_fr: 'Stage', label_en: 'Internship' },
  { id: 'volunteer', label_fr: 'Bénévolat', label_en: 'Volunteer' },
  { id: 'freelance', label_fr: 'Freelance', label_en: 'Freelance' },
];

export default function SubmitOpportunityPage({ params }: PageProps) {
  const lang = (params.lang || 'fr') as Language;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    opportunity_type: 'job',
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    country: 'Cameroun',
    region: '',
    city: '',
    address: '',
    is_remote: false,
    job_type: 'full_time',
    experience_required: '',
    education_required: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'XAF',
    salary_period: 'month',
    skills_required: '',
    benefits: '',
    tender_reference: '',
    budget_min: '',
    budget_max: '',
    submission_method: '',
    eligibility_criteria: '',
    market_category: '',
    deadline: '',
    categories: [] as number[],
  });

  const t = {
    title: lang === 'fr' ? 'Publier une opportunité' : 'Post an Opportunity',
    subtitle: lang === 'fr' ? 'Partagez une offre d\'emploi, un appel d\'offres ou une opportunité de marché' : 'Share a job offer, tender, or market opportunity',
    back: lang === 'fr' ? 'Retour aux opportunités' : 'Back to opportunities',
    step1: lang === 'fr' ? 'Type d\'opportunité' : 'Opportunity Type',
    step2: lang === 'fr' ? 'Informations générales' : 'General Information',
    step3: lang === 'fr' ? 'Détails spécifiques' : 'Specific Details',
    step4: lang === 'fr' ? 'Contact & Localisation' : 'Contact & Location',
    next: lang === 'fr' ? 'Suivant' : 'Next',
    previous: lang === 'fr' ? 'Précédent' : 'Previous',
    submit: lang === 'fr' ? 'Soumettre' : 'Submit',
    submitting: lang === 'fr' ? 'Envoi...' : 'Submitting...',
    successTitle: lang === 'fr' ? 'Opportunité soumise!' : 'Opportunity Submitted!',
    successMessage: lang === 'fr' ? 'Votre opportunité a été soumise et sera examinée par notre équipe.' : 'Your opportunity has been submitted and will be reviewed by our team.',
    viewOpportunities: lang === 'fr' ? 'Voir les opportunités' : 'View Opportunities',
    submitAnother: lang === 'fr' ? 'Soumettre une autre' : 'Submit Another',
    required: lang === 'fr' ? 'Requis' : 'Required',
    optional: lang === 'fr' ? 'Optionnel' : 'Optional',
    titleFr: lang === 'fr' ? 'Titre (Français)' : 'Title (French)',
    titleEn: lang === 'fr' ? 'Titre (Anglais)' : 'Title (English)',
    descriptionFr: lang === 'fr' ? 'Description (Français)' : 'Description (French)',
    descriptionEn: lang === 'fr' ? 'Description (Anglais)' : 'Description (English)',
    organization: lang === 'fr' ? 'Organisation' : 'Organization',
    contactName: lang === 'fr' ? 'Nom du contact' : 'Contact Name',
    contactEmail: lang === 'fr' ? 'Email de contact' : 'Contact Email',
    contactPhone: lang === 'fr' ? 'Téléphone' : 'Phone',
    website: lang === 'fr' ? 'Site web' : 'Website',
    country: lang === 'fr' ? 'Pays' : 'Country',
    region: lang === 'fr' ? 'Région' : 'Region',
    city: lang === 'fr' ? 'Ville' : 'City',
    address: lang === 'fr' ? 'Adresse' : 'Address',
    remote: lang === 'fr' ? 'Télétravail possible' : 'Remote work possible',
    jobType: lang === 'fr' ? 'Type de contrat' : 'Contract Type',
    experience: lang === 'fr' ? 'Expérience requise' : 'Required Experience',
    education: lang === 'fr' ? 'Formation requise' : 'Required Education',
    salaryMin: lang === 'fr' ? 'Salaire minimum' : 'Minimum Salary',
    salaryMax: lang === 'fr' ? 'Salaire maximum' : 'Maximum Salary',
    skills: lang === 'fr' ? 'Compétences requises (séparées par virgules)' : 'Required Skills (comma separated)',
    benefits: lang === 'fr' ? 'Avantages (séparés par virgules)' : 'Benefits (comma separated)',
    tenderRef: lang === 'fr' ? 'Référence de l\'appel' : 'Tender Reference',
    budgetMin: lang === 'fr' ? 'Budget minimum' : 'Minimum Budget',
    budgetMax: lang === 'fr' ? 'Budget maximum' : 'Maximum Budget',
    submissionMethod: lang === 'fr' ? 'Méthode de soumission' : 'Submission Method',
    eligibility: lang === 'fr' ? 'Critères d\'éligibilité' : 'Eligibility Criteria',
    marketCategory: lang === 'fr' ? 'Catégorie de marché' : 'Market Category',
    deadline: lang === 'fr' ? 'Date limite' : 'Deadline',
    selectCategories: lang === 'fr' ? 'Sélectionner les catégories' : 'Select Categories',
  };

  useEffect(() => {
    fetchCategories();
  }, [formData.opportunity_type]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/opportunities/categories?type=${formData.opportunity_type}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare data
      const submitData = {
        ...formData,
        skills_required: formData.skills_required ? formData.skills_required.split(',').map(s => s.trim()) : [],
        benefits: formData.benefits ? formData.benefits.split(',').map(s => s.trim()) : [],
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      };

      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to submit opportunity');
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
              href={`/${lang}/opportunities`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
            >
              <Briefcase size={20} />
              {t.viewOpportunities}
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setFormData({
                  opportunity_type: 'job',
                  title_fr: '',
                  title_en: '',
                  description_fr: '',
                  description_en: '',
                  organization_name: '',
                  contact_name: '',
                  contact_email: '',
                  contact_phone: '',
                  website_url: '',
                  country: 'Cameroun',
                  region: '',
                  city: '',
                  address: '',
                  is_remote: false,
                  job_type: 'full_time',
                  experience_required: '',
                  education_required: '',
                  salary_min: '',
                  salary_max: '',
                  salary_currency: 'XAF',
                  salary_period: 'month',
                  skills_required: '',
                  benefits: '',
                  tender_reference: '',
                  budget_min: '',
                  budget_max: '',
                  submission_method: '',
                  eligibility_criteria: '',
                  market_category: '',
                  deadline: '',
                  categories: [],
                });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
            >
              {t.submitAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-12 px-[5%]">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/${lang}/opportunities`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-blue-100">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-[5%] -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                )}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={cn(
                    'w-16 md:w-24 h-1 mx-2',
                    step > s ? 'bg-blue-600' : 'bg-gray-100'
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className="w-20 text-center">{t.step1}</span>
            <span className="w-20 text-center">{t.step2}</span>
            <span className="w-20 text-center">{t.step3}</span>
            <span className="w-20 text-center">{t.step4}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-[5%] py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Opportunity Type */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.step1}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {OPPORTUNITY_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange('opportunity_type', type.id)}
                    className={cn(
                      'p-6 rounded-xl border-2 text-left transition-all',
                      formData.opportunity_type === type.id
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    style={{
                      borderColor: formData.opportunity_type === type.id
                        ? (type.color === 'blue' ? '#3b82f6' : type.color === 'purple' ? '#8b5cf6' : '#22c55e')
                        : undefined,
                      backgroundColor: formData.opportunity_type === type.id
                        ? (type.color === 'blue' ? '#eff6ff' : type.color === 'purple' ? '#f5f3ff' : '#f0fdf4')
                        : undefined
                    }}
                  >
                    <Icon size={32} className={cn(
                      'mb-3',
                      formData.opportunity_type === type.id
                        ? (type.color === 'blue' ? 'text-blue-600' : type.color === 'purple' ? 'text-purple-600' : 'text-green-600')
                        : 'text-gray-400'
                    )} />
                    <h3 className="font-semibold text-gray-900">
                      {lang === 'fr' ? type.label_fr : type.label_en}
                    </h3>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: General Information */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.step2}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.titleFr} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title_fr}
                  onChange={(e) => handleChange('title_fr', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.titleEn} <span className="text-gray-400">({t.optional})</span>
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => handleChange('title_en', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.descriptionFr} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description_fr}
                  onChange={(e) => handleChange('description_fr', e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.descriptionEn} <span className="text-gray-400">({t.optional})</span>
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => handleChange('description_en', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t.selectCategories}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
                          formData.categories.includes(cat.id)
                            ? 'bg-blue-500 text-white border-transparent'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                        )}
                      >
                        {lang === 'fr' ? cat.name_fr : (cat.name_en || cat.name_fr)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  {t.deadline}
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Specific Details */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.step3}</h2>

            {formData.opportunity_type === 'job' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.jobType}
                    </label>
                    <select
                      value={formData.job_type}
                      onChange={(e) => handleChange('job_type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {JOB_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                          {lang === 'fr' ? type.label_fr : type.label_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_remote}
                        onChange={(e) => handleChange('is_remote', e.target.checked)}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{t.remote}</span>
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.experience}
                    </label>
                    <input
                      type="text"
                      value={formData.experience_required}
                      onChange={(e) => handleChange('experience_required', e.target.value)}
                      placeholder={lang === 'fr' ? 'ex: 2-5 ans' : 'e.g., 2-5 years'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.education}
                    </label>
                    <input
                      type="text"
                      value={formData.education_required}
                      onChange={(e) => handleChange('education_required', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      {t.salaryMin}
                    </label>
                    <input
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => handleChange('salary_min', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      {t.salaryMax}
                    </label>
                    <input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => handleChange('salary_max', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.skills}
                  </label>
                  <input
                    type="text"
                    value={formData.skills_required}
                    onChange={(e) => handleChange('skills_required', e.target.value)}
                    placeholder={lang === 'fr' ? 'Chirurgie, Diagnostic, Vaccination...' : 'Surgery, Diagnosis, Vaccination...'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.benefits}
                  </label>
                  <input
                    type="text"
                    value={formData.benefits}
                    onChange={(e) => handleChange('benefits', e.target.value)}
                    placeholder={lang === 'fr' ? 'Assurance santé, Transport, Formation...' : 'Health insurance, Transport, Training...'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            )}

            {formData.opportunity_type === 'tender' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.tenderRef}
                  </label>
                  <input
                    type="text"
                    value={formData.tender_reference}
                    onChange={(e) => handleChange('tender_reference', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      {t.budgetMin}
                    </label>
                    <input
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => handleChange('budget_min', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      {t.budgetMax}
                    </label>
                    <input
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => handleChange('budget_max', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.submissionMethod}
                  </label>
                  <textarea
                    value={formData.submission_method}
                    onChange={(e) => handleChange('submission_method', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.eligibility}
                  </label>
                  <textarea
                    value={formData.eligibility_criteria}
                    onChange={(e) => handleChange('eligibility_criteria', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            )}

            {formData.opportunity_type === 'market' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.marketCategory}
                  </label>
                  <input
                    type="text"
                    value={formData.market_category}
                    onChange={(e) => handleChange('market_category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Contact & Location */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t.step4}</h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building size={16} className="inline mr-1" />
                    {t.organization} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={(e) => handleChange('organization_name', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contactName}
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contactEmail} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contactPhone}
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.website}
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleChange('website_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <hr className="my-6" />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    {t.country} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.region}
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.address}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              {t.previous}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && !formData.title_fr}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {t.next}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.title_fr || !formData.organization_name || !formData.contact_email}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

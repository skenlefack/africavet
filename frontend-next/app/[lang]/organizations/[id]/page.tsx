'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, MapPin, Globe, Mail, Phone, Users, Calendar, Briefcase, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { getImageUrl } from '@/lib/api';

export default function OrganizationDetailPage() {
  const params = useParams();
  const lang = (params.lang as Language) || 'fr';
  const orgId = params.id;

  const [org, setOrg] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    back: lang === 'fr' ? 'Retour à l\'annuaire' : 'Back to directory',
    about: lang === 'fr' ? 'À propos' : 'About',
    contact: lang === 'fr' ? 'Contact' : 'Contact',
    opportunities: lang === 'fr' ? 'Opportunités publiées' : 'Published Opportunities',
    noOpportunities: lang === 'fr' ? 'Aucune opportunité publiée' : 'No published opportunities',
    website: lang === 'fr' ? 'Site web' : 'Website',
    founded: lang === 'fr' ? 'Fondée en' : 'Founded in',
    staff: lang === 'fr' ? 'Effectif' : 'Staff',
    notFound: lang === 'fr' ? 'Organisation introuvable' : 'Organization not found',
    children: lang === 'fr' ? 'Organisations affiliées' : 'Affiliated organizations',
  };

  useEffect(() => {
    fetchOrg();
    fetchOpportunities();
  }, [orgId]);

  const fetchOrg = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mapping/organizations/${orgId}`);
      const data = await res.json();
      if (data.success) setOrg(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`/api/mapping/organizations/${orgId}/opportunities`);
      const data = await res.json();
      if (data.success) setOpportunities(data.data || []);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <Building2 size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">{t.notFound}</p>
        <Link href={`/${lang}/organizations`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft size={16} /> {t.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white py-8 px-4 md:px-[5%]">
      <div className="container mx-auto max-w-4xl">
        {/* Back link */}
        <Link href={`/${lang}/organizations`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft size={16} /> {t.back}
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-6">
            {org.logo ? (
              <img src={getImageUrl(org.logo)} alt={org.name} className="w-24 h-24 rounded-xl object-contain bg-gray-50 p-2" />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 size={40} className="text-blue-400" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
              {org.acronym && <span className="text-gray-400 font-medium">{org.acronym}</span>}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                {org.country && (
                  <span className="flex items-center gap-1"><MapPin size={14} /> {[org.city, org.country].filter(Boolean).join(', ')}</span>
                )}
                {org.type && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{org.type}</span>
                )}
                {org.founded_year && (
                  <span className="flex items-center gap-1"><Calendar size={14} /> {t.founded} {org.founded_year}</span>
                )}
                {org.staff_count > 0 && (
                  <span className="flex items-center gap-1"><Users size={14} /> {org.staff_count} {t.staff}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <Globe size={14} /> {t.website} <ExternalLink size={12} />
                  </a>
                )}
                {org.contact_email && (
                  <a href={`mailto:${org.contact_email}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <Mail size={14} /> {org.contact_email}
                  </a>
                )}
                {org.contact_phone && (
                  <a href={`tel:${org.contact_phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone size={14} /> {org.contact_phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {(org.description || org.mission) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-lg text-gray-900 mb-3">{t.about}</h2>
            <div className="prose prose-sm text-gray-600 max-w-none" dangerouslySetInnerHTML={{ __html: org.description || org.mission }} />
          </div>
        )}

        {/* Children organizations */}
        {org.children && org.children.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-lg text-gray-900 mb-3">{t.children}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {org.children.map((child: any) => (
                <Link key={child.id} href={`/${lang}/organizations/${child.id}`}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Building2 size={16} className="text-blue-400" />
                  <span className="text-sm font-medium text-gray-700">{child.name}</span>
                  {child.acronym && <span className="text-xs text-gray-400">({child.acronym})</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <Briefcase size={20} className="text-purple-500" />
            {t.opportunities}
          </h2>
          {opportunities.length === 0 ? (
            <p className="text-gray-400 text-sm">{t.noOpportunities}</p>
          ) : (
            <div className="space-y-2">
              {opportunities.map((opp: any) => (
                <Link key={opp.id} href={`/${lang}/opportunities/${opp.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div>
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full mr-2',
                      opp.opportunity_type === 'job' ? 'bg-blue-100 text-blue-700' :
                      opp.opportunity_type === 'tender' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    )}>
                      {opp.opportunity_type === 'job' ? (lang === 'fr' ? 'Emploi' : 'Job') :
                       opp.opportunity_type === 'tender' ? (lang === 'fr' ? 'Appel d\'offres' : 'Tender') :
                       (lang === 'fr' ? 'Marché' : 'Market')}
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {lang === 'en' && opp.title_en ? opp.title_en : opp.title_fr}
                    </span>
                  </div>
                  {opp.country && <span className="text-xs text-gray-400">{opp.country}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

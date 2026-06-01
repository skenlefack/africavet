import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from '../../uiStyle/FontAwesome';

const TYPE_CONFIG = {
  job: { label: 'Emploi', color: '#2196F3', icon: 'briefcase' },
  tender: { label: "Appel d'offres", color: '#FF9800', icon: 'gavel' },
  market: { label: 'Marché', color: '#9C27B0', icon: 'handshake-o' },
  // Legacy mappings
  emploi: { label: 'Emploi', color: '#2196F3', icon: 'briefcase' },
  appel_offre: { label: "Appel d'offres", color: '#FF9800', icon: 'gavel' },
  marche: { label: 'Marché', color: '#9C27B0', icon: 'handshake-o' },
  bourse: { label: 'Bourse', color: '#4CAF50', icon: 'graduation-cap' },
};

const JOB_TYPE_LABELS = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  contract: 'Contrat',
  internship: 'Stage',
  volunteer: 'Bénévolat',
  freelance: 'Freelance',
};

const OpportunityCard = ({ opportunity }) => {
  const opp = opportunity;
  const type = opp.opportunity_type || opp.type;
  const config = TYPE_CONFIG[type] || { label: type || 'Autre', color: '#607D8B', icon: 'file-text-o' };
  const displayTitle = opp.title_fr || opp.title || 'Sans titre';
  const displayDesc = opp.description_fr || opp.description || '';
  const org = opp.organization_name || opp.organization || '';
  const country = opp.country || '';
  const city = opp.city || '';
  const deadline = opp.deadline;
  const jobType = opp.job_type;
  const salaryMin = opp.salary_min;
  const salaryMax = opp.salary_max;
  const salaryCurrency = opp.salary_currency || 'XAF';
  const isFeatured = opp.is_featured;
  const isUrgent = opp.is_urgent;

  const truncate = (text, max) => {
    if (!text) return '';
    const stripped = text.replace(/<[^>]+>/g, '');
    return stripped.length > max ? stripped.substring(0, max).trim() + '...' : stripped;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatSalary = () => {
    if (!salaryMin && !salaryMax) return null;
    const fmt = (n) => Number(n).toLocaleString('fr-FR');
    if (salaryMin && salaryMax) return `${fmt(salaryMin)} - ${fmt(salaryMax)} ${salaryCurrency}`;
    if (salaryMin) return `${fmt(salaryMin)}+ ${salaryCurrency}`;
    return `${fmt(salaryMax)} ${salaryCurrency}`;
  };

  const isExpired = deadline && new Date(deadline) < new Date();

  const daysLeft = () => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return null;
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    return `${diff}j`;
  };

  const remaining = daysLeft();
  const salary = formatSalary();

  return (
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
    >
      {/* Featured/Urgent ribbon */}
      {(isFeatured || isUrgent) && (
        <div style={{ background: isUrgent ? '#f44336' : '#FF9800', color: '#fff', fontSize: '11px', fontWeight: '700', textAlign: 'center', padding: '3px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isUrgent ? <><FontAwesome name="bolt" /> Urgent</> : <><FontAwesome name="star" /> En vedette</>}
        </div>
      )}

      <div className="card-body d-flex flex-column" style={{ padding: '20px' }}>
        {/* Type badge + deadline */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge" style={{ backgroundColor: config.color, color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
            <FontAwesome name={config.icon} /> {config.label}
          </span>
          {isExpired ? (
            <span className="badge" style={{ backgroundColor: '#f44336', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>Expirée</span>
          ) : remaining ? (
            <span className="badge" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>
              <FontAwesome name="clock-o" /> {remaining}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h5 style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.4', marginBottom: '10px', minHeight: '42px' }}>
          <Link to={`/opportunites/${opp.id}`} style={{ color: '#1a1a2e', textDecoration: 'none' }}
            onMouseEnter={(e) => e.target.style.color = '#354e84'}
            onMouseLeave={(e) => e.target.style.color = '#1a1a2e'}
          >
            {truncate(displayTitle, 75)}
          </Link>
        </h5>

        {/* Organization */}
        {org && (
          <p style={{ color: '#444', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>
            <FontAwesome name="building-o" style={{ color: '#999', width: '16px' }} /> {org}
          </p>
        )}

        {/* Location */}
        {(country || city) && (
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '6px' }}>
            <FontAwesome name="map-marker" style={{ color: '#999', width: '16px' }} /> {[city, country].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Tags row: job type + salary */}
        <div className="d-flex flex-wrap gap-1 mb-2">
          {jobType && JOB_TYPE_LABELS[jobType] && (
            <span style={{ fontSize: '11px', background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '4px' }}>
              {JOB_TYPE_LABELS[jobType]}
            </span>
          )}
          {salary && (
            <span style={{ fontSize: '11px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px' }}>
              <FontAwesome name="money" /> {salary}
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>
          {truncate(displayDesc, 100)}
        </p>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3" style={{ borderTop: '1px solid #f0f0f0' }}>
          {deadline && (
            <small style={{ color: '#999', fontSize: '12px' }}>
              <FontAwesome name="calendar" /> {formatDate(deadline)}
            </small>
          )}
          <Link
            to={`/opportunites/${opp.id}`}
            className="btn btn-sm"
            style={{ background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', padding: '5px 14px' }}
          >
            Voir <FontAwesome name="arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;

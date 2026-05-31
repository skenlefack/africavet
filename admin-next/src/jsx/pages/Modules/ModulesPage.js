import React from 'react';
import { Link } from 'react-router-dom';

const modules = [
    {
        name: 'Sliders',
        description: 'Gestion des carrousels et diaporamas du site',
        icon: 'fa-images',
        color: '#7ac142',
        to: '/sliders',
        status: 'active'
    },
    {
        name: 'Newsletter',
        description: 'Campagnes email, listes de diffusion et abonnés',
        icon: 'fa-envelope-open-text',
        color: '#354e84',
        to: '/newsletter',
        status: 'active'
    },
    {
        name: 'Page Builder',
        description: 'Constructeur de pages visuel par blocs',
        icon: 'fa-magic',
        color: '#E67E22',
        to: '/pagebuilder',
        status: 'active'
    },
    {
        name: 'Annuaire Panafricain',
        description: 'Répertoire des établissements vétérinaires en Afrique',
        icon: 'fa-globe-africa',
        color: '#27AE60',
        to: '/annuaire',
        status: 'active'
    },
    {
        name: 'E-Learning',
        description: 'Cours en ligne, quiz, certificats et parcours de formation',
        icon: 'fa-graduation-cap',
        color: '#8E44AD',
        to: '/elearning',
        status: 'active'
    },
    {
        name: 'Publicités',
        description: 'Gestion des bannières publicitaires et emplacements',
        icon: 'fa-ad',
        color: '#E74C3C',
        to: '/ads/dashboard',
        status: 'active'
    },
    {
        name: 'Analytiques',
        description: 'Statistiques de visite, tendances et géolocalisation',
        icon: 'fa-chart-line',
        color: '#17a2b8',
        to: '/analytics',
        status: 'active'
    }
];

const ModulesPage = () => {
    const activeCount = modules.filter(m => m.status === 'active').length;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Modules</h2>
                    <p className="text-muted mb-0">{activeCount} modules actifs</p>
                </div>
            </div>

            <div className="row">
                {modules.map((mod, idx) => (
                    <div key={idx} className="col-xl-4 col-md-6 mb-4">
                        <div className="card h-100" style={{ borderTop: `3px solid ${mod.color}` }}>
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                        style={{ width: '50px', height: '50px', background: `${mod.color}15` }}>
                                        <i className={`fas ${mod.icon} fa-lg`} style={{ color: mod.color }}></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-0">{mod.name}</h5>
                                        <span className={`badge ${mod.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                            {mod.status === 'active' ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-muted mb-3">{mod.description}</p>
                                <Link to={mod.to} className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-arrow-right me-1"></i> Accéder
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ModulesPage;

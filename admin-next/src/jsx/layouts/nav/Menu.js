import { SVGICON } from "../../constant/theme";

export const MenuList = [
    // Dashboard
    {
        title: 'Tableau de bord',
        iconStyle: SVGICON.Home,
        to: 'dashboard',
    },
    {
        title: 'Analytiques',
        iconStyle: SVGICON.Charts,
        to: 'analytics',
    },

    // Content Management
    {
        title: 'CONTENU',
        classsChange: 'menu-title'
    },
    {
        title: 'Articles',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Blog,
        content: [
            {
                title: 'Tous les articles',
                to: 'posts',
            },
            {
                title: 'Ajouter',
                to: 'posts/new',
            },
        ],
    },
    {
        title: 'Catégories',
        iconStyle: SVGICON.Apps,
        to: 'categories',
    },
    {
        title: 'Pages',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Pages,
        content: [
            {
                title: 'Toutes les pages',
                to: 'pages',
            },
            {
                title: 'Page Builder',
                to: 'pagebuilder',
            },
        ],
    },
    {
        title: 'Médias',
        iconStyle: SVGICON.Widget,
        to: 'media',
    },
    {
        title: 'Menus',
        iconStyle: SVGICON.Table,
        to: 'menus',
    },

    // Modules
    {
        title: 'MODULES',
        classsChange: 'menu-title'
    },
    {
        title: 'Modules',
        iconStyle: SVGICON.Plugins,
        to: 'modules',
    },
    {
        title: 'Sliders',
        iconStyle: SVGICON.Charts,
        to: 'sliders',
    },
    {
        title: 'Newsletter',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Forms,
        content: [
            {
                title: 'Tableau de bord',
                to: 'newsletter',
            },
            {
                title: 'Nouvelle campagne',
                to: 'newsletter/campaigns/new',
            },
        ],
    },

    // AfricaVet Specific
    {
        title: 'AFRICAVET',
        classsChange: 'menu-title'
    },
    {
        title: 'Annuaire Panafricain',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.ContactSvg,
        content: [
            {
                title: 'Tableau de bord',
                to: 'annuaire',
            },
            {
                title: 'Rechercher',
                to: 'annuaire/list',
            },
            {
                title: 'Clinique & Soins',
                to: 'annuaire/list?category=clinique-soins',
            },
            {
                title: 'Diagnostic & Labos',
                to: 'annuaire/list?category=diagnostic-labos',
            },
            {
                title: 'Pharmacie & Fournisseurs',
                to: 'annuaire/list?category=pharmacie-fournisseurs',
            },
            {
                title: 'Filières & Services',
                to: 'annuaire/list?category=filieres-services',
            },
            {
                title: 'Formation & Institutions',
                to: 'annuaire/list?category=formation-institutions',
            },
            {
                title: 'En attente',
                to: 'annuaire/pending',
            },
            {
                title: 'Importer',
                to: 'annuaire/import',
            },
            {
                title: 'Ajouter',
                to: 'annuaire/new',
            },
        ],
    },
    {
        title: 'Alertes Vétérinaires',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Charts,
        content: [
            {
                title: 'Tableau de bord',
                to: 'alerts',
            },
            {
                title: 'Toutes les alertes',
                to: 'alerts/list',
            },
            {
                title: 'En attente',
                to: 'alerts/list?status=pending',
            },
        ],
    },
    {
        title: 'Opportunités',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Blog,
        content: [
            {
                title: 'Tableau de bord',
                to: 'opportunities',
            },
            {
                title: 'Toutes les opportunités',
                to: 'opportunities/list',
            },
            {
                title: 'Ajouter',
                to: 'opportunities/new',
            },
            {
                title: 'En attente',
                to: 'opportunities/list?status=pending',
            },
        ],
    },
    {
        title: 'Documents',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Forms,
        content: [
            {
                title: 'Tableau de bord',
                to: 'documents',
            },
            {
                title: 'Tous les documents',
                to: 'documents/list',
            },
            {
                title: 'Ajouter',
                to: 'documents/new',
            },
            {
                title: 'Catégories',
                to: 'documents/categories',
            },
        ],
    },
    {
        title: 'E-Learning',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Bootstrap,
        content: [
            {
                title: 'Tableau de bord',
                to: 'elearning',
            },
            {
                title: 'Cours',
                to: 'elearning/courses',
            },
            {
                title: 'Modules',
                to: 'elearning/modules',
            },
            {
                title: 'Questions',
                to: 'elearning/questions',
            },
            {
                title: 'Quiz',
                to: 'elearning/quizzes',
            },
            {
                title: 'Étudiants',
                to: 'elearning/students',
            },
            {
                title: 'Certificats',
                to: 'elearning/certificates',
            },
            {
                title: 'Parcours',
                to: 'elearning/paths',
            },
            {
                title: 'Catégories',
                to: 'elearning/categories',
            },
        ],
    },
    {
        title: 'Publicités',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Charts,
        content: [
            {
                title: 'Tableau de bord',
                to: 'ads/dashboard',
            },
            {
                title: 'Toutes les publicités',
                to: 'ads',
            },
            {
                title: 'Ajouter',
                to: 'ads/new',
            },
            {
                title: 'Emplacements',
                to: 'ads/placements',
            },
            {
                title: 'Fournisseurs',
                to: 'ads/providers',
            },
            {
                title: 'Statistiques',
                to: 'ads/statistics',
            },
        ],
    },
    // Administration
    {
        title: 'ADMINISTRATION',
        classsChange: 'menu-title'
    },
    {
        title: 'Utilisateurs',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.ContactSvg,
        content: [
            {
                title: 'Tous les utilisateurs',
                to: 'users',
            },
            {
                title: 'Ajouter',
                to: 'users/new',
            },
            {
                title: 'Groupes',
                to: 'groups',
            },
        ],
    },
    {
        title: 'Thèmes',
        iconStyle: SVGICON.Widget,
        to: 'themes',
    },
    {
        title: 'Paramètres',
        iconStyle: SVGICON.Plugins,
        to: 'settings',
    },
];

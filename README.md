# 🐾 AfricaVet CMS - Système de Gestion de Contenu pour la Médecine Vétérinaire en Afrique

Un CMS complet et moderne avec backend Node.js/Express, base de données MySQL, et frontend Next.js avec design professionnel.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![MySQL](https://img.shields.io/badge/mysql-%3E%3D8.0-orange)

## 🚀 Fonctionnalités

### Backend API
- ✅ **Authentification JWT** - Login sécurisé avec tokens
- ✅ **Gestion des utilisateurs** - Rôles (admin, editor, author, subscriber)
- ✅ **CRUD Posts** - Articles, pages, news, events, ressources
- ✅ **Catégories & Tags** - Organisation du contenu
- ✅ **Médiathèque** - Upload et gestion de fichiers
- ✅ **Commentaires** - Avec modération
- ✅ **Paramètres du site** - Configuration flexible
- ✅ **Menus dynamiques** - Création de menus
- ✅ **Dashboard** - Statistiques et analytics
- ✅ **Log d'activité** - Suivi des actions
- ✅ **E-Learning** - Cours et formations en ligne
- ✅ **Newsletter** - Gestion des abonnés et campagnes

### Admin Panel
- ✅ **Interface moderne** - Design professionnel dark/light mode
- ✅ **Éditeur WYSIWYG** - TinyMCE intégré
- ✅ **Dashboard interactif** - Statistiques en temps réel
- ✅ **Gestion des médias** - Upload drag & drop
- ✅ **SEO intégré** - Meta tags, descriptions
- ✅ **Responsive** - Compatible mobile

### Frontend Public
- ✅ **Design moderne** - Effets modernes, animations
- ✅ **Multilingue** - Français/Anglais
- ✅ **Performance optimisée** - Next.js avec SSR
- ✅ **Blog complet** - Liste, filtres, pagination
- ✅ **Articles détaillés** - Partage social, articles liés
- ✅ **Recherche** - Recherche full-text
- ✅ **Newsletter** - Inscription email
- ✅ **Responsive** - Mobile-first

## 📁 Structure du Projet

```
africavet-cms/
├── backend/                 # API Node.js/Express
│   ├── config/
│   │   ├── db.js           # Configuration MySQL
│   │   └── database.sql    # Schéma BDD
│   ├── middleware/
│   │   └── auth.js         # JWT Authentication
│   ├── routes/             # Routes API
│   ├── services/           # Services (email, etc.)
│   ├── uploads/            # Fichiers uploadés
│   ├── server.js           # Point d'entrée
│   └── package.json
│
├── admin/                   # Panel Admin React
│   ├── src/
│   │   └── AdminApp.jsx    # Application complète
│   └── package.json
│
├── frontend-next/          # Site Public Next.js
│   ├── app/                # Routes Next.js
│   ├── components/         # Composants React
│   ├── lib/                # Utilitaires
│   └── package.json
│
├── docker/                 # Configuration Docker
│   └── nginx/              # Configuration Nginx
│
├── docker-compose.yml      # Docker pour développement local
└── docker-compose.prod.yml # Docker pour production
```

## ⚙️ Installation avec Docker

### Prérequis
- Docker Desktop
- Docker Compose

### Démarrage rapide

```bash
# Cloner le projet
git clone https://github.com/your-repo/africavet-cms.git
cd africavet-cms

# Copier et configurer .env
cp .env.production.example .env

# Démarrer les containers
docker compose up -d

# Voir les logs
docker compose logs -f
```

Les services seront disponibles sur:
- **Frontend:** http://localhost:3003
- **Admin:** http://localhost:3004
- **API:** http://localhost:5001/api

## 🔐 Connexion Admin

**Compte par défaut :**
- Email: `admin@africavet.com`
- Password: `admin123`

⚠️ **Important:** Changez ce mot de passe immédiatement après la première connexion!

## 📡 API Endpoints

### Authentification
```
POST   /api/auth/register     # Inscription
POST   /api/auth/login        # Connexion
GET    /api/auth/me           # Utilisateur actuel
PUT    /api/auth/profile      # Modifier profil
PUT    /api/auth/password     # Changer mot de passe
```

### Posts
```
GET    /api/posts             # Liste (filtres: status, type, category, search)
GET    /api/posts/:slug       # Détail d'un article
POST   /api/posts             # Créer (auth required)
PUT    /api/posts/:id         # Modifier (auth required)
DELETE /api/posts/:id         # Supprimer (admin/editor)
```

### Catégories
```
GET    /api/categories        # Liste
GET    /api/categories/:slug  # Détail
POST   /api/categories        # Créer (admin/editor)
PUT    /api/categories/:id    # Modifier (admin/editor)
DELETE /api/categories/:id    # Supprimer (admin)
```

### Médias
```
GET    /api/media             # Liste
POST   /api/media/upload      # Upload (multipart/form-data)
PUT    /api/media/:id         # Modifier métadonnées
DELETE /api/media/:id         # Supprimer
```

### Dashboard
```
GET    /api/dashboard/stats        # Statistiques
GET    /api/dashboard/recent-posts # Posts récents
GET    /api/dashboard/activity     # Log d'activité
```

## 🔧 Scripts Disponibles

### Docker
```bash
docker compose up -d          # Démarrer
docker compose down           # Arrêter
docker compose logs -f        # Voir les logs
docker compose build --no-cache # Reconstruire
```

### Backend (développement local)
```bash
cd backend
npm install
npm run dev   # Développement (nodemon)
```

### Frontend (développement local)
```bash
cd frontend-next
npm install
npm run dev   # Développement
```

## 📦 Technologies Utilisées

### Backend
- **Express.js** - Framework web
- **MySQL2** - Connecteur MySQL
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **bcryptjs** - Hash des mots de passe
- **Nodemailer** - Envoi d'emails
- **Helmet** - Sécurité HTTP

### Frontend
- **Next.js 14** - Framework React avec SSR
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **Lucide React** - Icônes

### Admin
- **React 18** - Framework UI
- **TinyMCE** - Éditeur WYSIWYG
- **Recharts** - Graphiques
- **React Router** - Navigation

## 🛡️ Sécurité

- Authentification JWT avec expiration
- Hash bcrypt pour les mots de passe
- Validation des entrées
- Protection CORS
- Headers de sécurité (Helmet)
- Limite de taille des uploads

## 📄 Licence

MIT License - Libre d'utilisation et de modification.

## 🤝 Support

Pour toute question ou problème, créez une issue sur le repository.

---

**Développé avec ❤️ pour la communauté vétérinaire africaine**

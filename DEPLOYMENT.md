# AfricaVet CMS - Guide de Déploiement Production

## Configuration Requise

**OS:** Ubuntu 22.04+ LTS
**Ressources minimum:** 2 CPU, 2GB RAM, 20GB SSD
**Docker:** Docker Engine + Docker Compose

---

## URLs Production (à configurer)

| Service | URL |
|---------|-----|
| Site principal | https://africavet.com |
| Site (www) | https://www.africavet.com |
| Admin CMS | https://admin.africavet.com |
| API | https://africavet.com/api |

---

## Architecture Docker

```
/var/www/africavet-cms/
├── docker-compose.prod.yml
├── .env (credentials production)
├── backend/
├── frontend-next/
├── admin/
└── docker/
    ├── nginx/conf.d/default.conf
    └── certbot/
```

### Containers

| Container | Image | Port |
|-----------|-------|------|
| africavet-db | mysql:8.0 | 3306 |
| africavet-backend | africavet-cms-backend | 5000 |
| africavet-frontend | africavet-cms-frontend | 3002 |
| africavet-admin | africavet-cms-admin | 80 |
| africavet-nginx | nginx:alpine | 80, 443 |
| africavet-certbot | certbot/certbot | - |

---

## Commandes de Déploiement

### 1. Se connecter au serveur
```bash
ssh user@your-server-ip
cd /var/www/africavet-cms
```

### 2. Configurer l'environnement
```bash
# Copier le fichier d'exemple
cp .env.production.example .env

# Éditer avec vos credentials
nano .env
```

### 3. Démarrer les services

**Tous les services:**
```bash
sudo docker compose -f docker-compose.prod.yml build --no-cache
sudo docker compose -f docker-compose.prod.yml up -d
```

**Frontend uniquement:**
```bash
sudo docker compose -f docker-compose.prod.yml build frontend --no-cache
sudo docker compose -f docker-compose.prod.yml up -d frontend
```

**Backend uniquement:**
```bash
sudo docker compose -f docker-compose.prod.yml build backend --no-cache
sudo docker compose -f docker-compose.prod.yml up -d backend
```

**Admin uniquement:**
```bash
sudo docker compose -f docker-compose.prod.yml build admin --no-cache
sudo docker compose -f docker-compose.prod.yml up -d admin
```

### 4. Vérifier le statut
```bash
sudo docker compose -f docker-compose.prod.yml ps
sudo docker compose -f docker-compose.prod.yml logs -f [service]
```

---

## Base de Données

### Credentials Production
- **Host:** db (interne Docker)
- **Database:** africavet_cms
- **User:** africavet_user
- **Password:** [À configurer dans .env]

### Exporter la base locale
```bash
docker exec africavet-db mysqldump -u root -p africavet_cms > db_export.sql
```

### Importer en production
```bash
docker exec -i africavet-db mysql -u root -p africavet_cms < db_export.sql
```

---

## SSL / Certificats

**Certificat:** Let's Encrypt (auto-renouvellement via certbot)

### Initialiser SSL (première fois)
```bash
./init-letsencrypt.sh
```

### Renouveler manuellement
```bash
sudo docker compose -f docker-compose.prod.yml run --rm certbot renew
```

---

## SMTP / Email

Configurer dans `.env`:
```env
SMTP_HOST=votre-serveur-smtp
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@africavet.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM=noreply@africavet.com
```

---

## Workflow de Développement

### 1. Développer en local
```bash
# Démarrer l'environnement local
docker compose up -d

# Accéder aux services
# Frontend: http://localhost:3003
# Admin: http://localhost:3004
# API: http://localhost:5001
```

### 2. Tester les modifications

### 3. Commiter dans Git
```bash
git add .
git commit -m "feat: description de la fonctionnalité"
git push origin main
```

### 4. Déployer en production
```bash
# Sur le serveur
git pull origin main
sudo docker compose -f docker-compose.prod.yml build --no-cache
sudo docker compose -f docker-compose.prod.yml up -d
```

---

## Problèmes Connus et Solutions

### Permission denied sur uploads
**Cause:** Le container backend utilise l'utilisateur expressjs (UID 1001)
**Solution:**
```bash
sudo chown -R 1001:1001 /var/www/africavet-cms/backend/uploads
```

### Container backend en restart loop
**Cause:** Dossiers uploads manquants
**Solution:**
```bash
sudo mkdir -p backend/uploads/elearning/videos backend/uploads/elearning/thumbnails
sudo chown -R 1001:1001 backend/uploads
```

---

## Contacts

- **Email:** contact@africavet.com
- **Support technique:** [À compléter]

---

*Dernière mise à jour: 4 février 2026*

# AOS MICEPP - Système d'Administration Backend

## Aperçu Général

L'Association Sociale du Ministère de l'Investissement, de la Convergence et de l'Évaluation des Politiques Publiques (AOS MICEPP) développe ce système backend d'administration pour la gestion interne des services sociaux. Ce système intègre une interface complète pour les rôles Admin et Support, permettant la gestion des utilisateurs, demandes de services, réclamations, notifications et rapports. Il est conçu pour être sécurisé, évolutif et intégré avec une base de données PostgreSQL, utilisant des technologies modernes full-stack.

Le système facilite la supervision des opérations, l'assignation des tâches, la génération de rapports et la communication en temps réel via notifications et WebSockets.

## Fonctionnalités Principales

### 1. Gestion des Utilisateurs (Admin)
- **Inscription d'utilisateurs** : Création de comptes pour Agents, Supports et Admins avec envoi d'email automatique (mot de passe temporaire).
- **Gestion des rôles** : Attribution et modification des rôles (Agent, Support, Admin).
- **Authentification sécurisée** : Connexion via JWT, changement de mot de passe, protection par rôles.

### 2. Tableau de Bord (Admin)
- **Statistiques globales** : Nombre de demandes, réclamations, utilisateurs actifs, statuts des services.
- **Statut système** : Surveillance de la santé du système (base de données, services).
- **Statistiques par utilisateur** : Détails sur les demandes assignées à un utilisateur spécifique.
- **Génération de rapports** : Export de rapports périodiques sur les activités.

### 3. Gestion des Demandes (Admin/Support)
- **Visualisation des demandes** : Liste complète avec filtres par statut (en attente, en cours, acceptée, refusée, terminée).
- **Assignation (Admin)** : Attribution/désattribution des demandes à des utilisateurs Support.
- **Traitement (Support)** : Mise à jour du statut, ajout de commentaires, upload de documents de réponse pour les demandes assignées.
- **Téléchargement de documents** : Accès sécurisé aux justificatifs soumis et réponses.
- **Notifications automatiques** : Alertes lors d'assignation, mise à jour ou finalisation.

### 4. Gestion des Réclamations (Admin/Support)
- **Liste des réclamations** : Avec filtres par statut (en attente, en cours, résolue, fermée).
- **Assignation (Admin)** : Attribution à des utilisateurs Support ou Admin.
- **Traitement (Support)** : Mise à jour du statut, progression et résolution des réclamations assignées.
- **Détails et historique** : Vue complète avec dates et commentaires.

### 5. Publication de Contenu (Admin)
- **Gestion des actualités** : Création, modification et publication d'articles d'actualités.
- **Gestion des documents** : Upload et partage de documents publics (PDF, images, etc.).
- **Gestion des annonces** : Publication d'annonces et communications importantes.
- **Catalogue des services** : Mise à jour des informations sur les services sociaux.

### 6. Notifications et Communication
- **Système de notifications** : Création et envoi de notifications (info, succès, avertissement, erreur) via WebSockets.
- **Types de notifications** : Assignation de demandes, mises à jour, finalisations.
- **Gestion utilisateur** : Marquage comme lu, suppression.

### 7. Services et Entités
- **Gestion des services** : Catalogue des services sociaux (colonies de vacances, assistance médicale, etc.) avec informations dynamiques.
- **Documents publics** : Gestion des actualités, articles et documents partagés.

### 8. Sécurité et Conformité
- **Authentification JWT** : Tokens sécurisés avec expiration configurable.
- **Autorisations par rôle** : Guards pour Admin, Support, Agent.
- **Upload sécurisé** : Validation des types de fichiers (PDF, images, docs), taille max 50MB, stockage compressé.
- **Audit et logs** : Traçabilité des actions via AOP.

### 9. Interface Utilisateur (Frontend)
- **Pages Admin** : Dashboard, gestion des demandes/réclamations, utilisateurs, services, actualités, publications.
- **Pages Support** : Assignation et traitement des demandes/réclamations assignées, notifications.
- **Authentification** : Pages de connexion, changement de mot de passe.
- **Responsive Design** : Adapté mobile/desktop avec Angular Material et Tailwind CSS.
- **Multilingue** : Support FR/AR via ngx-translate.
- **Thèmes** : Mode sombre/clair.

## Architecture Technique

### Backend (Spring Boot 3.2.12)
- **Framework** : Spring Boot avec JPA/Hibernate, Security, Mail, WebSocket, Validation.
- **Base de Données** : PostgreSQL avec scripts d'initialisation (DDL auto create-drop en dev).
- **Sécurité** : JWT (JJWT), Spring Security avec @PreAuthorize.
- **API** : RESTful avec OpenAPI/Swagger UI.
- **Services** : Gestion des demandes, réclamations, utilisateurs, notifications, emails (SendGrid).
- **Entités** : Utilisateur, Demande, Reclamation, Notification, ServiceEntity, etc.
- **DTOs** : Mapping avec ModelMapper pour les réponses API.
- **Configuration** : Profils (dev/prod), variables d'environnement pour DB, JWT, email.

### Frontend (Angular 20)
- **Framework** : Angular standalone components, RxJS pour observables.
- **UI/UX** : Angular Material, Tailwind CSS, ngx-quill pour éditeur riche.
- **Services** : HTTP avec intercepteurs auth, gestion des demandes, réclamations, notifications.
- **Routing** : Lazy loading, guards de rôle, résolvers.
- **WebSockets** : SockJS/StompJS pour notifications temps réel.
- **Environnements** : Dev/Prod avec API URL configurable.

### Déploiement
- **Conteneurs** : Docker pour backend (Maven build) et frontend (Nginx).
- **Base de Données** : PostgreSQL en conteneur ou externe.
- **Variables** : Configuration via .env ou application.yml.

## Installation et Configuration

### Prérequis
- Java 17+ et Maven.
- Node.js 18+ et npm.
- PostgreSQL.
- Docker (optionnel).

### Backend
1. Cloner : `git clone <repo-url>`.
2. Naviguer : `cd aos_micepp_back/aos_backend`.
3. Configurer `application-dev.yml` : Variables DB, JWT_SECRET_KEY, SENDGRID_API_KEY.
4. Compiler : `mvn clean install`.
5. Lancer : `mvn spring-boot:run` (port 8089).

### Frontend
1. Naviguer : `cd aos_micepp_back/aos_frontend`.
2. Installer : `npm install`.
3. Configurer `environment.ts` : apiUrl: 'http://localhost:8089/AOS_MICEPP'.
4. Lancer : `ng serve` (port 4200).

### Déploiement Docker
- Backend : `docker build -t aos-backend .` puis `docker run -p 8089:8089 aos-backend`.
- Frontend : `docker build -t aos-frontend .` puis `docker run -p 80:80 aos-frontend`.

## API Endpoints (Exemples)
- **Auth** : POST `/auth/login` → JWT.
- **Admin** : POST `/api/v1/admin/users/register-user` (Admin only).
- **Dashboard** : GET `/api/v1/admin/dashboard/stats` (Admin only).
- **Demandes** : GET `/demandes` (Admin), PATCH `/demandes/{id}/assign/{userId}` (Admin).
- **Réclamations** : GET `/Reclamation/All` (Admin), PATCH `/Reclamation/{id}/update` (Admin/Support).
- **Notifications** : GET `/api/notifications` (authenticated).
- **Utilisateurs** : GET `/api/users` (Admin).

Tous endpoints privés nécessitent `Authorization: Bearer <JWT>`.

## Support et Contribution
- **Contact** : support@aos-micepp.ma.
- **Issues** : GitHub Issues.
- **Contributions** : PR avec tests.

© 2025 AOS MICEPP. Tous droits réservés.

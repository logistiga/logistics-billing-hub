# 📚 Documentation Complète - Application de Gestion Logistique

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Tableau de Bord](#tableau-de-bord)
4. [Gestion des Clients](#gestion-des-clients)
5. [Ordres de Travail](#ordres-de-travail)
6. [Facturation](#facturation)
7. [Rapports et Statistiques](#rapports-et-statistiques)
8. [Administration](#administration)
9. [API Externe](#api-externe)
10. [Guide Technique](#guide-technique)

---

## 1. Vue d'ensemble

### Description de l'Application

Cette application est un système de gestion logistique complet conçu pour gérer les opérations portuaires, incluant :

- **Gestion des clients** : Création et suivi des clients
- **Ordres de travail** : Gestion des opérations de transport et manutention
- **Facturation** : Génération de factures et suivi des paiements
- **Conteneurs** : Suivi des conteneurs import/export
- **Rapports** : Statistiques et analyses

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Pages / Composants / Services API                    │
├─────────────────────────────────────────────────────────┤
│                    Backend (Laravel)                     │
│  - Controllers / Models / Policies / Migrations         │
├─────────────────────────────────────────────────────────┤
│                    Base de données (MySQL)               │
│  - Tables / Relations / Index                           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Authentification

### Page : `/login`

#### Description
Page de connexion permettant aux utilisateurs d'accéder à l'application.

#### Fonctionnalités

| Action | Description |
|--------|-------------|
| **Connexion** | Saisie email + mot de passe |
| **Remember Me** | Option pour rester connecté |
| **Mot de passe oublié** | Lien vers la réinitialisation |

#### Champs du formulaire

| Champ | Type | Obligatoire | Validation |
|-------|------|-------------|------------|
| Email | email | ✅ | Format email valide |
| Mot de passe | password | ✅ | Minimum 8 caractères |

#### Rôles et Permissions

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **super-admin** | Accès total | Toutes les permissions |
| **admin** | Administrateur | Gestion complète sauf configuration système |
| **manager** | Gestionnaire | Création/modification ordres et factures |
| **operator** | Opérateur | Création ordres uniquement |
| **viewer** | Lecteur | Consultation uniquement |

---

## 3. Tableau de Bord

### Page : `/` ou `/dashboard`

#### Description
Vue d'ensemble des activités et statistiques de l'entreprise.

#### Widgets disponibles

| Widget | Description | Données affichées |
|--------|-------------|-------------------|
| **Chiffre d'affaires** | Total mensuel/annuel | Montant en FCFA |
| **Ordres de travail** | Compteur par statut | En attente, En cours, Terminés |
| **Factures** | Aperçu facturation | À payer, Payées, En retard |
| **Conteneurs** | Suivi conteneurs | Import/Export actifs |
| **Graphiques** | Évolution temporelle | Courbes mensuelles |

#### Actions rapides

- ➕ Créer un ordre de travail
- ➕ Créer une facture
- 📊 Voir les rapports
- 👥 Gérer les clients

---

## 4. Gestion des Clients

### Page : `/clients`

#### Description
Liste et gestion de tous les clients de l'entreprise.

#### Fonctionnalités

| Action | Description | Permission requise |
|--------|-------------|-------------------|
| **Voir la liste** | Afficher tous les clients | `clients.view` |
| **Rechercher** | Filtrer par nom, code, email | `clients.view` |
| **Créer** | Ajouter un nouveau client | `clients.create` |
| **Modifier** | Éditer les informations | `clients.edit` |
| **Supprimer** | Supprimer un client | `clients.delete` |
| **Exporter** | Export Excel/PDF | `clients.export` |

#### Champs du client

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `code` | string | ✅ | Code unique du client (ex: CLI001) |
| `name` | string | ✅ | Raison sociale |
| `email` | email | ❌ | Adresse email principale |
| `phone` | string | ❌ | Numéro de téléphone |
| `address` | text | ❌ | Adresse postale |
| `city` | string | ❌ | Ville |
| `country` | string | ❌ | Pays |
| `tax_id` | string | ❌ | Numéro d'identification fiscale |
| `contact_person` | string | ❌ | Personne de contact |
| `notes` | text | ❌ | Notes internes |

---

## 5. Ordres de Travail

### 5.1 Liste des Ordres

#### Page : `/ordres-travail`

| Action | Description | Permission |
|--------|-------------|------------|
| **Liste** | Voir tous les ordres | `ordres.view` |
| **Filtrer** | Par statut, date, client | `ordres.view` |
| **Rechercher** | Par numéro, client | `ordres.view` |
| **Créer** | Nouveau ordre | `ordres.create` |

#### Statuts des ordres

| Statut | Description | Couleur |
|--------|-------------|---------|
| `draft` | Brouillon | Gris |
| `pending` | En attente | Orange |
| `in_progress` | En cours | Bleu |
| `completed` | Terminé | Vert |
| `cancelled` | Annulé | Rouge |

---

### 5.2 Création d'Ordre de Travail

#### Page : `/ordres-travail/nouveau`

#### Types d'opérations

| Type | Sous-catégorie | Description |
|------|----------------|-------------|
| **Transport** | Import Conteneurs | Transport de conteneurs à l'import |
| **Transport** | Export Conteneurs | Transport de conteneurs à l'export |
| **Transport** | Import Conventionnel | Transport marchandises conventionnelles import |
| **Transport** | Export Conventionnel | Transport marchandises conventionnelles export |
| **Manutention** | Chargement | Opérations de chargement |
| **Manutention** | Déchargement | Opérations de déchargement |
| **Manutention** | Transfert | Transfert de marchandises |

#### Formulaire de création

**Section 1 : Informations générales**

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `client_id` | select | ✅ | Client concerné |
| `date` | date | ✅ | Date de l'opération |
| `description` | text | ❌ | Description libre |

**Section 2 : Transport (si applicable)**

| Champ | Type | Description |
|-------|------|-------------|
| `origin` | string | Lieu de départ |
| `destination` | string | Lieu d'arrivée |
| `vessel_name` | string | Nom du navire |
| `voyage_number` | string | Numéro de voyage |
| `bl_number` | string | Numéro B/L |
| `booking_number` | string | Numéro de booking |

**Section 3 : Conteneurs**

| Champ | Type | Description |
|-------|------|-------------|
| `container_number` | string | Numéro du conteneur (ex: MSCU1234567) |
| `container_type` | select | Type (20', 40', 40'HC, etc.) |
| `seal_number` | string | Numéro de scellé |
| `weight` | number | Poids en tonnes |

**Section 4 : Lignes de service**

| Champ | Type | Description |
|-------|------|-------------|
| `service_id` | select | Service à facturer |
| `quantity` | number | Quantité |
| `unit_price` | number | Prix unitaire |
| `description` | string | Description ligne |

---

### 5.3 Ordres en Attente

#### Page : `/ordres-travail/en-attente`

#### Description
Réception automatique des conteneurs depuis l'application externe, groupés par numéro de booking.

#### Fonctionnalités

| Action | Description |
|--------|-------------|
| **Voir les bookings** | Liste des bookings en attente |
| **Détails conteneurs** | Voir les conteneurs d'un booking |
| **Créer ordre** | Transformer un booking en ordre de travail |
| **Créer en masse** | Créer plusieurs ordres à la fois |
| **Rejeter** | Refuser un booking |

#### Règle de groupement

```
Booking BK2024001 → 2 conteneurs (MSCU1234567, MSCU7654321)
                  → 1 seul ordre de travail avec 2 lignes conteneurs
```

#### Statuts des conteneurs en attente

| Statut | Description |
|--------|-------------|
| `pending` | En attente de traitement |
| `processed` | Ordre de travail créé |
| `rejected` | Rejeté |

---

### 5.4 Notes de Début/Fin

#### Page : `/ordres-travail/:id/notes`

| Type de note | Description |
|--------------|-------------|
| **Note de début** | Enregistrement au démarrage de l'opération |
| **Note de fin** | Enregistrement à la clôture de l'opération |

---

## 6. Facturation

### 6.1 Liste des Factures

#### Page : `/factures`

| Action | Permission | Description |
|--------|------------|-------------|
| **Voir** | `invoices.view` | Consulter les factures |
| **Créer** | `invoices.create` | Nouvelle facture |
| **Modifier** | `invoices.edit` | Éditer une facture |
| **Supprimer** | `invoices.delete` | Supprimer (si non payée) |
| **Valider** | `invoices.validate` | Valider une facture |
| **Envoyer** | `invoices.send` | Envoyer par email |
| **Imprimer** | `invoices.view` | Générer PDF |
| **Exporter** | `invoices.export` | Export liste |

#### Statuts des factures

| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| `draft` | Brouillon | Modifier, Supprimer |
| `pending` | En attente de paiement | Envoyer, Ajouter paiement |
| `partial` | Partiellement payée | Ajouter paiement |
| `paid` | Payée | Aucune (sauf admin) |
| `overdue` | En retard | Relance |
| `cancelled` | Annulée | Aucune |

---

### 6.2 Création de Facture

#### Page : `/factures/nouvelle`

#### Sections du formulaire

**En-tête**

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `client_id` | select | ✅ |
| `date` | date | ✅ |
| `due_date` | date | ✅ |
| `reference` | string | ❌ |

**Lignes de facture**

| Champ | Type | Description |
|-------|------|-------------|
| `description` | string | Description du service |
| `quantity` | number | Quantité |
| `unit_price` | number | Prix unitaire HT |
| `tax_rate` | number | Taux de taxe (%) |
| `amount` | number | Montant calculé |

**Totaux**

| Champ | Calcul |
|-------|--------|
| Sous-total HT | Σ (quantité × prix unitaire) |
| Total taxes | Σ (sous-total × taux taxe) |
| Total TTC | Sous-total + Taxes |

---

### 6.3 Paiements

#### Page : `/factures/:id/paiements`

| Action | Permission | Description |
|--------|------------|-------------|
| **Ajouter paiement** | `payments.create` | Enregistrer un paiement |
| **Voir historique** | `invoices.view` | Consulter les paiements |

#### Méthodes de paiement

| Méthode | Description |
|---------|-------------|
| `cash` | Espèces |
| `check` | Chèque |
| `bank_transfer` | Virement bancaire |
| `mobile_money` | Mobile Money |
| `card` | Carte bancaire |

---

## 7. Rapports et Statistiques

### 7.1 Tableau de Bord Analytique

#### Page : `/rapports`

| Rapport | Description |
|---------|-------------|
| **Chiffre d'affaires** | Évolution CA mensuel/annuel |
| **Opérations** | Nombre d'ordres par type |
| **Clients** | Top clients par CA |
| **Conteneurs** | Volume import/export |
| **Paiements** | Suivi encaissements |

### 7.2 Exports

| Format | Contenu |
|--------|---------|
| **Excel** | Données brutes avec filtres |
| **PDF** | Rapport formaté |

---

## 8. Administration

### 8.1 Gestion des Utilisateurs

#### Page : `/admin/utilisateurs`

| Action | Permission |
|--------|------------|
| **Créer utilisateur** | `users.create` |
| **Modifier** | `users.edit` |
| **Désactiver** | `users.delete` |
| **Attribuer rôle** | `roles.assign` |

### 8.2 Gestion des Rôles

#### Page : `/admin/roles`

| Action | Description |
|--------|-------------|
| **Créer rôle** | Nouveau rôle personnalisé |
| **Permissions** | Attribuer des permissions |

### 8.3 Paramètres

#### Page : `/admin/parametres`

| Section | Paramètres |
|---------|------------|
| **Entreprise** | Nom, adresse, logo, NIF |
| **Facturation** | Numérotation, taxes par défaut |
| **Email** | Configuration SMTP |
| **Sécurité** | Politique mots de passe |

### 8.4 Services et Tarifs

#### Page : `/admin/services`

| Champ | Description |
|-------|-------------|
| `code` | Code du service |
| `name` | Nom du service |
| `category` | Catégorie (Transport, Manutention) |
| `unit_price` | Prix unitaire par défaut |
| `unit` | Unité (conteneur, tonne, voyage) |

### 8.5 Clés API

#### Page : `/admin/api-keys`

| Action | Description |
|--------|-------------|
| **Générer clé** | Créer nouvelle clé API |
| **Permissions** | Définir les droits de la clé |
| **Révoquer** | Désactiver une clé |

---

## 9. API Externe

### 9.1 Authentification API

Toutes les requêtes API externes doivent inclure :

```
Header: X-API-Key: votre_cle_api
```

### 9.2 Endpoints Disponibles

#### Réception de Conteneurs

```http
POST /api/external/containers
```

**Corps de la requête :**

```json
{
  "client_name": "COMILOG SA",
  "client_id": 1,
  "vessel_name": "MSC OSCAR",
  "shipping_line": "MSC",
  "eta": "2024-12-30",
  "etd": "2024-12-31",
  "operation_type": "import",
  "containers": [
    {
      "booking_number": "BK2024001",
      "container_number": "MSCU1234567",
      "container_type": "40HC",
      "weight": 25.5,
      "seal_number": "SEAL123"
    },
    {
      "booking_number": "BK2024001",
      "container_number": "MSCU7654321",
      "container_type": "20GP",
      "weight": 18.2
    }
  ]
}
```

**Réponse succès :**

```json
{
  "success": true,
  "message": "2 conteneurs reçus avec succès",
  "data": {
    "received": 2,
    "booking_numbers": ["BK2024001"]
  }
}
```

#### Récupération des Conteneurs en Attente

```http
GET /api/external/containers/pending
```

**Réponse :**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_number": "BK2024001",
      "container_number": "MSCU1234567",
      "status": "pending",
      "created_at": "2024-12-29T10:00:00Z"
    }
  ]
}
```

### 9.3 Codes d'Erreur

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Requête invalide |
| `401` | Non authentifié |
| `403` | Non autorisé |
| `404` | Ressource non trouvée |
| `422` | Erreur de validation |
| `500` | Erreur serveur |

---

## 10. Guide Technique

### 10.1 Installation

#### Prérequis

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+

#### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

#### Frontend (React)

```bash
npm install
cp .env.example .env
npm run dev
```

### 10.2 Variables d'Environnement

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

#### Backend (.env)

```env
APP_NAME="Gestion Logistique"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=logistique
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

### 10.3 Structure des Fichiers

```
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
├── src/
│   ├── components/
│   │   ├── ui/           # Composants Shadcn
│   │   ├── layout/       # Layout principal
│   │   └── forms/        # Formulaires
│   ├── hooks/            # Hooks React personnalisés
│   ├── pages/            # Pages de l'application
│   ├── services/api/     # Services API
│   └── lib/              # Utilitaires
```

### 10.4 Base de Données

#### Tables Principales

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs système |
| `roles` | Rôles et permissions |
| `clients` | Clients |
| `ordres_travail` | Ordres de travail |
| `ordre_travail_containers` | Conteneurs des ordres |
| `ordre_travail_lines` | Lignes de service |
| `invoices` | Factures |
| `invoice_items` | Lignes de facture |
| `payments` | Paiements |
| `pending_containers` | Conteneurs en attente |
| `services` | Catalogue services |
| `api_keys` | Clés API externes |

### 10.5 Permissions Complètes

```
clients.view, clients.create, clients.edit, clients.delete, clients.export

ordres.view, ordres.create, ordres.edit, ordres.delete, ordres.validate

invoices.view, invoices.create, invoices.edit, invoices.delete
invoices.validate, invoices.send, invoices.export

payments.view, payments.create, payments.delete

users.view, users.create, users.edit, users.delete
roles.view, roles.create, roles.edit, roles.assign

reports.view, reports.export

settings.view, settings.edit

api.manage
```

---

## 📞 Support

Pour toute question ou assistance :
- Email : support@exemple.com
- Documentation en ligne : `/api-docs`

---

*Documentation générée le 29 décembre 2024*

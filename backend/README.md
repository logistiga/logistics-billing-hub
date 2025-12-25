# Backend Laravel 11

Ce dossier contient les fichiers de référence pour votre API Laravel 11.

## ⚠️ Important

**Ces fichiers ne s'exécutent pas dans Lovable.** Lovable est une plateforme frontend uniquement.

Pour utiliser ce backend :

1. Installez Laravel 11 sur votre serveur :
```bash
composer create-project laravel/laravel nom-projet
```

2. Copiez les fichiers de ce dossier vers votre projet Laravel

3. Installez les dépendances :
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

4. Configurez votre `.env` avec les accès base de données

5. Exécutez les migrations :
```bash
php artisan migrate
```

6. Lancez le serveur :
```bash
php artisan serve
```

## Structure des fichiers

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ClientController.php
│   │   │   │   ├── InvoiceController.php
│   │   │   │   ├── OrdreTravailController.php
│   │   │   │   ├── CreditController.php
│   │   │   │   ├── NoteDebutController.php
│   │   │   │   ├── BanqueController.php
│   │   │   │   └── AvoirController.php
│   │   │   └── Controller.php
│   │   └── Requests/
│   │       ├── LoginRequest.php
│   │       ├── ClientRequest.php
│   │       └── ...
│   └── Models/
│       ├── Client.php
│       ├── Invoice.php
│       ├── OrdreTravail.php
│       └── ...
├── database/
│   └── migrations/
│       └── *.php
├── routes/
│   └── api.php
└── config/
    └── cors.php
```

## Configuration CORS

Assurez-vous de configurer CORS pour autoriser votre frontend Lovable :

```php
// config/cors.php
'allowed_origins' => ['https://votre-app.lovable.app', 'http://localhost:5173'],
```

## URL Frontend

Configurez `VITE_API_URL` dans votre frontend Lovable pour pointer vers votre API :

```
VITE_API_URL=https://votre-api.com/api
```

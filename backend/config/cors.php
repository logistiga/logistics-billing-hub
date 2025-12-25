<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configurer les origines autorisées pour les requêtes cross-origin.
    | Ajoutez l'URL de votre frontend Lovable ici.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://*.lovable.app',
        'https://*.lovableproject.com',
        // Ajoutez votre domaine de production ici
        // 'https://votre-app.lovable.app',
    ],

    'allowed_origins_patterns' => [
        '#^https://[a-z0-9-]+\.lovable\.app$#',
        '#^https://[a-z0-9-]+\.lovableproject\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

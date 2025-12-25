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

    // Autoriser CORS sur toutes les routes (utile si vos endpoints ne sont pas préfixés par /api)
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://*.lovable.app',
        'https://*.lovableproject.com',
        'https://d16b9f7b-d97a-41e1-b5d0-a72f0873dc6d.lovableproject.com',
        // Ngrok URLs
        'https://*.ngrok-free.app',
        'https://*.ngrok.io',
    ],

    'allowed_origins_patterns' => [
        '#^https://[a-z0-9-]+\.lovable\.app$#',
        '#^https://[a-z0-9-]+\.lovableproject\.com$#',
        '#^https://[a-z0-9-]+\.ngrok-free\.app$#',
        '#^https://[a-z0-9-]+\.ngrok\.io$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

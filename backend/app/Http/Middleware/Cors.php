<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     * CORS simplifié pour ngrok + Lovable
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin') ?? '*';
        
        // Liste des patterns autorisés
        $allowedPatterns = [
            '/^https:\/\/[a-z0-9-]+\.lovable\.app$/',
            '/^https:\/\/[a-z0-9-]+\.lovableproject\.com$/',
            '/^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/',
            '/^https:\/\/[a-z0-9-]+\.ngrok\.io$/',
            '/^http:\/\/localhost:\d+$/',
        ];
        
        $isAllowed = false;
        foreach ($allowedPatterns as $pattern) {
            if (preg_match($pattern, $origin)) {
                $isAllowed = true;
                break;
            }
        }
        
        // Headers CORS
        $headers = [
            'Access-Control-Allow-Origin' => $isAllowed ? $origin : 'null',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept, Origin, ngrok-skip-browser-warning',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age' => '86400',
            'Vary' => 'Origin',
        ];
        
        // Preflight OPTIONS
        if ($request->isMethod('OPTIONS')) {
            return response('', 204, $headers);
        }
        
        $response = $next($request);
        
        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }
        
        return $response;
    }
}

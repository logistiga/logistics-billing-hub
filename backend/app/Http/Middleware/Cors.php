<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * Important: CORS must handle OPTIONS (preflight) even when no OPTIONS route exists.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');
        $allowedOrigin = $this->resolveAllowedOrigin($origin);

        // If browser sends preflight headers, echo them back (simplest + compatible with ngrok header)
        $requestedHeaders = $request->headers->get('Access-Control-Request-Headers');
        $allowHeaders = $requestedHeaders ?: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, ngrok-skip-browser-warning';

        $response = $request->isMethod('OPTIONS')
            ? response('', 204)
            : $next($request);

        // If origin is not allowed, don't attach CORS headers
        if (!$allowedOrigin) {
            return $response;
        }

        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
        $response->headers->set('Vary', 'Origin');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', $allowHeaders);

        if ((bool) config('cors.supports_credentials', false)) {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        $maxAge = (int) (config('cors.max_age', 86400) ?: 86400);
        $response->headers->set('Access-Control-Max-Age', (string) $maxAge);

        return $response;
    }

    private function resolveAllowedOrigin(?string $origin): ?string
    {
        if (!$origin) {
            return null;
        }

        $allowedOrigins = config('cors.allowed_origins', []);
        $allowedOrigins = is_array($allowedOrigins) ? $allowedOrigins : [$allowedOrigins];

        $supportsCredentials = (bool) config('cors.supports_credentials', false);

        // Wildcard support
        if (in_array('*', $allowedOrigins, true)) {
            return $supportsCredentials ? $origin : '*';
        }

        if (in_array($origin, $allowedOrigins, true)) {
            return $origin;
        }

        $patterns = config('cors.allowed_origins_patterns', []);
        $patterns = is_array($patterns) ? $patterns : [$patterns];

        foreach ($patterns as $pattern) {
            if (is_string($pattern) && $pattern !== '' && @preg_match($pattern, $origin)) {
                return $origin;
            }
        }

        return null;
    }
}

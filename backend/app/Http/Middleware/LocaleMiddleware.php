<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LocaleMiddleware
{
    /**
     * Handle an incoming request.
     * Sets the application locale based on request headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language', config('app.locale', 'fr'));

        // Extract primary language code (e.g., 'fr-FR' -> 'fr')
        $locale = substr($locale, 0, 2);

        // Validate locale
        $supportedLocales = ['fr', 'en', 'es', 'de', 'ar'];
        
        if (!in_array($locale, $supportedLocales)) {
            $locale = config('app.fallback_locale', 'fr');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}

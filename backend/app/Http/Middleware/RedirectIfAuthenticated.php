<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     * Redirects authenticated users away from guest-only routes.
     */
    public function handle(Request $request, Closure $next, ...$guards): Response
    {
        foreach ($guards as $guard) {
            if (auth($guard)->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous êtes déjà authentifié.',
                ], 400);
            }
        }

        return $next($request);
    }
}

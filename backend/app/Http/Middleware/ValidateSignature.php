<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateSignature
{
    /**
     * Handle an incoming request.
     * Validates signed URLs.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->hasValidSignature()) {
            return response()->json([
                'success' => false,
                'message' => 'Lien invalide ou expiré.',
            ], 403);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveUser
{
    /**
     * Handle an incoming request.
     * Ensures the authenticated user account is active.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte a été désactivé. Contactez l\'administrateur.',
            ], 403);
        }

        return $next($request);
    }
}

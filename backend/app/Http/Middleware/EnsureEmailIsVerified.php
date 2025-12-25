<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     * Ensures the user's email is verified.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Votre adresse email n\'est pas vérifiée.',
                'email_verified' => false,
            ], 403);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventRequestsDuringMaintenance
{
    /**
     * URIs that should be accessible during maintenance mode.
     */
    protected array $except = [
        'api/health',
        'api/status',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->isDownForMaintenance()) {
            foreach ($this->except as $except) {
                if ($request->is($except)) {
                    return $next($request);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Application en maintenance. Veuillez réessayer plus tard.',
            ], 503);
        }

        return $next($request);
    }
}

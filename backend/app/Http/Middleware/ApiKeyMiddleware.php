<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $apiKey = $request->header('X-API-Key');

        if (empty($apiKey)) {
            return response()->json([
                'success' => false,
                'error' => 'API key missing',
                'message' => 'Please provide an API key in the X-API-Key header',
            ], 401);
        }

        // Find the API key
        $keyModel = ApiKey::findByKey($apiKey);

        if (!$keyModel) {
            Log::warning('Invalid API key attempt', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Invalid API key',
                'message' => 'The provided API key is not valid',
            ], 401);
        }

        // Check if key is valid (active and not expired)
        if (!$keyModel->isValid()) {
            return response()->json([
                'success' => false,
                'error' => 'API key expired or inactive',
                'message' => 'The API key has expired or has been deactivated',
            ], 401);
        }

        // Check rate limiting
        $rateLimitKey = 'api_rate_limit:' . $keyModel->id;
        $requests = Cache::get($rateLimitKey, 0);

        if ($requests >= $keyModel->rate_limit) {
            return response()->json([
                'success' => false,
                'error' => 'Rate limit exceeded',
                'message' => "You have exceeded the rate limit of {$keyModel->rate_limit} requests per minute",
                'retry_after' => 60,
            ], 429);
        }

        // Increment rate limit counter
        Cache::put($rateLimitKey, $requests + 1, 60);

        // Check permission if specified
        if ($permission && !$keyModel->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'error' => 'Permission denied',
                'message' => "This API key does not have the '{$permission}' permission",
            ], 403);
        }

        // Record usage (async to not slow down request)
        $keyModel->recordUsage($request->ip());

        // Add API key info to request for later use
        $request->attributes->set('api_key', $keyModel);

        // Add rate limit headers
        $response = $next($request);

        if ($response instanceof Response) {
            $response->headers->set('X-RateLimit-Limit', $keyModel->rate_limit);
            $response->headers->set('X-RateLimit-Remaining', max(0, $keyModel->rate_limit - $requests - 1));
            $response->headers->set('X-RateLimit-Reset', Cache::get($rateLimitKey . ':reset', time() + 60));
        }

        return $response;
    }
}

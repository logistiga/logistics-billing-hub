<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApiKeyController extends Controller
{
    /**
     * Liste toutes les clés API
     */
    public function index(Request $request)
    {
        $keys = ApiKey::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'prefix' => $key->prefix,
                    'display_key' => $key->getDisplayKey(),
                    'permissions' => $key->permissions,
                    'rate_limit' => $key->rate_limit,
                    'expires_at' => $key->expires_at?->toISOString(),
                    'last_used_at' => $key->last_used_at?->toISOString(),
                    'last_used_ip' => $key->last_used_ip,
                    'is_active' => $key->is_active,
                    'created_by' => $key->creator?->name,
                    'description' => $key->description,
                    'created_at' => $key->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $keys,
        ]);
    }

    /**
     * Créer une nouvelle clé API
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'rate_limit' => 'nullable|integer|min:1|max:1000',
            'expires_at' => 'nullable|date|after:now',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Generate the key
        $keyData = ApiKey::generateKey();

        $apiKey = ApiKey::create([
            'name' => $request->name,
            'key' => $keyData['hashed'],
            'prefix' => $keyData['prefix'],
            'permissions' => $request->permissions ?? ['*'],
            'rate_limit' => $request->rate_limit ?? 60,
            'expires_at' => $request->expires_at,
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'API key created successfully',
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key' => $keyData['raw'], // Only returned once!
                'prefix' => $apiKey->prefix,
                'permissions' => $apiKey->permissions,
                'rate_limit' => $apiKey->rate_limit,
                'expires_at' => $apiKey->expires_at?->toISOString(),
                'created_at' => $apiKey->created_at->toISOString(),
            ],
            'warning' => 'Save this key now. You won\'t be able to see it again!',
        ], 201);
    }

    /**
     * Afficher une clé API
     */
    public function show(ApiKey $apiKey)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'prefix' => $apiKey->prefix,
                'display_key' => $apiKey->getDisplayKey(),
                'permissions' => $apiKey->permissions,
                'rate_limit' => $apiKey->rate_limit,
                'expires_at' => $apiKey->expires_at?->toISOString(),
                'last_used_at' => $apiKey->last_used_at?->toISOString(),
                'last_used_ip' => $apiKey->last_used_ip,
                'is_active' => $apiKey->is_active,
                'created_by' => $apiKey->creator?->name,
                'description' => $apiKey->description,
                'created_at' => $apiKey->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Mettre à jour une clé API
     */
    public function update(Request $request, ApiKey $apiKey)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'string',
            'rate_limit' => 'sometimes|integer|min:1|max:1000',
            'expires_at' => 'nullable|date|after:now',
            'is_active' => 'sometimes|boolean',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $apiKey->update($request->only([
            'name',
            'permissions',
            'rate_limit',
            'expires_at',
            'is_active',
            'description',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'API key updated successfully',
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'prefix' => $apiKey->prefix,
                'permissions' => $apiKey->permissions,
                'rate_limit' => $apiKey->rate_limit,
                'expires_at' => $apiKey->expires_at?->toISOString(),
                'is_active' => $apiKey->is_active,
            ],
        ]);
    }

    /**
     * Supprimer (révoquer) une clé API
     */
    public function destroy(ApiKey $apiKey)
    {
        $apiKey->delete();

        return response()->json([
            'success' => true,
            'message' => 'API key revoked successfully',
        ]);
    }

    /**
     * Régénérer une clé API
     */
    public function regenerate(ApiKey $apiKey)
    {
        $keyData = ApiKey::generateKey();

        $apiKey->update([
            'key' => $keyData['hashed'],
            'prefix' => $keyData['prefix'],
            'last_used_at' => null,
            'last_used_ip' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'API key regenerated successfully',
            'data' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key' => $keyData['raw'], // Only returned once!
                'prefix' => $apiKey->prefix,
            ],
            'warning' => 'Save this key now. You won\'t be able to see it again!',
        ]);
    }

    /**
     * Lister les permissions disponibles
     */
    public function permissions()
    {
        return response()->json([
            'success' => true,
            'data' => ApiKey::availablePermissions(),
        ]);
    }
}

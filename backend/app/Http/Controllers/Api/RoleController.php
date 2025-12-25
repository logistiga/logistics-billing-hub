<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Liste des rôles
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Créer un rôle
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
            'description' => $validated['description'] ?? null,
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'success' => true,
            'data' => $role->load('permissions'),
            'message' => 'Rôle créé avec succès',
        ], 201);
    }

    /**
     * Afficher un rôle
     */
    public function show(Role $role)
    {
        return response()->json([
            'success' => true,
            'data' => $role->load('permissions'),
        ]);
    }

    /**
     * Mettre à jour un rôle
     */
    public function update(Request $request, Role $role)
    {
        // Ne pas modifier les rôles système
        if (in_array($role->name, ['admin', 'super-admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rôle ne peut pas être modifié',
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:roles,name,' . $role->id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update([
            'name' => $validated['name'] ?? $role->name,
            'description' => $validated['description'] ?? $role->description,
        ]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'success' => true,
            'data' => $role->fresh()->load('permissions'),
            'message' => 'Rôle mis à jour',
        ]);
    }

    /**
     * Supprimer un rôle
     */
    public function destroy(Role $role)
    {
        // Ne pas supprimer les rôles système
        if (in_array($role->name, ['admin', 'super-admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rôle ne peut pas être supprimé',
            ], 422);
        }

        // Vérifier qu'aucun utilisateur n'a ce rôle
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Ce rôle est assigné à des utilisateurs',
            ], 422);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rôle supprimé',
        ], 204);
    }

    /**
     * Liste des permissions
     */
    public function permissions()
    {
        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode('.', $permission->name)[0];
        });

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ]);
    }

    /**
     * Créer une permission
     */
    public function createPermission(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions',
            'description' => 'nullable|string|max:500',
        ]);

        $permission = Permission::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return response()->json([
            'success' => true,
            'data' => $permission,
            'message' => 'Permission créée',
        ], 201);
    }

    /**
     * Supprimer une permission
     */
    public function deletePermission(Permission $permission)
    {
        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission supprimée',
        ], 204);
    }
}

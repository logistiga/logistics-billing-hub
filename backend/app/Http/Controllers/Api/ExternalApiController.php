<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\OrdreTravail;
use App\Models\LignePrestation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ExternalApiController extends Controller
{
    // ==========================================
    // HEALTH CHECK
    // ==========================================

    public function health()
    {
        return response()->json([
            'success' => true,
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0',
        ]);
    }

    // ==========================================
    // CLIENTS - READ
    // ==========================================

    public function clients(Request $request)
    {
        $query = Client::query();

        // Filtres
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $clients = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $clients->items(),
            'meta' => [
                'current_page' => $clients->currentPage(),
                'last_page' => $clients->lastPage(),
                'per_page' => $clients->perPage(),
                'total' => $clients->total(),
            ],
        ]);
    }

    public function showClient(int $id)
    {
        $client = Client::with('contacts')->find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'error' => 'Client not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $client,
        ]);
    }

    // ==========================================
    // CLIENTS - WRITE
    // ==========================================

    public function createClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:50',
            'type' => 'nullable|in:particulier,entreprise',
            'notes' => 'nullable|string',
            'external_id' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $client = Client::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Client created successfully',
            'data' => $client,
        ], 201);
    }

    public function updateClient(Request $request, int $id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'error' => 'Client not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:50',
            'type' => 'nullable|in:particulier,entreprise',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $client->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Client updated successfully',
            'data' => $client->fresh(),
        ]);
    }

    // ==========================================
    // ORDRES DE TRAVAIL - READ
    // ==========================================

    public function ordresTravail(Request $request)
    {
        $query = OrdreTravail::with(['client:id,name,email,phone']);

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        if ($request->has('external_id')) {
            $query->where('external_id', $request->external_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('booking_number', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $ordres = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $ordres->items(),
            'meta' => [
                'current_page' => $ordres->currentPage(),
                'last_page' => $ordres->lastPage(),
                'per_page' => $ordres->perPage(),
                'total' => $ordres->total(),
            ],
        ]);
    }

    public function showOrdreTravail(int $id)
    {
        $ordre = OrdreTravail::with(['client', 'lignesPrestations'])->find($id);

        if (!$ordre) {
            return response()->json([
                'success' => false,
                'error' => 'Ordre de travail not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ordre,
        ]);
    }

    // ==========================================
    // ORDRES DE TRAVAIL - WRITE
    // ==========================================

    public function createOrdreTravail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'type' => 'required|string|max:100',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'external_id' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:50',
            // Booking fields
            'booking_number' => 'nullable|string|max:100',
            'bl_number' => 'nullable|string|max:100',
            'vessel_name' => 'nullable|string|max:255',
            'voyage_number' => 'nullable|string|max:100',
            'port_origin' => 'nullable|string|max:255',
            'port_destination' => 'nullable|string|max:255',
            'eta' => 'nullable|date',
            'etd' => 'nullable|date',
            // Containers
            'containers' => 'nullable|array',
            'containers.*.number' => 'required|string',
            'containers.*.type' => 'nullable|string',
            'containers.*.size' => 'nullable|string',
            // Lignes prestations
            'lignes_prestations' => 'nullable|array',
            'lignes_prestations.*.description' => 'required|string',
            'lignes_prestations.*.quantite' => 'required|numeric|min:0',
            'lignes_prestations.*.prix_unitaire' => 'required|numeric|min:0',
            'lignes_prestations.*.unite' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create ordre
            $ordre = OrdreTravail::create([
                'client_id' => $request->client_id,
                'date' => $request->date,
                'type' => $request->type,
                'reference' => $request->reference,
                'description' => $request->description,
                'external_id' => $request->external_id,
                'source' => $request->source ?? 'external_api',
                'status' => 'pending',
                'booking_number' => $request->booking_number,
                'bl_number' => $request->bl_number,
                'vessel_name' => $request->vessel_name,
                'voyage_number' => $request->voyage_number,
                'port_origin' => $request->port_origin,
                'port_destination' => $request->port_destination,
                'eta' => $request->eta,
                'etd' => $request->etd,
                'containers' => $request->containers,
            ]);

            // Add lignes prestations
            if ($request->has('lignes_prestations')) {
                foreach ($request->lignes_prestations as $ligne) {
                    LignePrestation::create([
                        'ordre_travail_id' => $ordre->id,
                        'description' => $ligne['description'],
                        'quantite' => $ligne['quantite'],
                        'prix_unitaire' => $ligne['prix_unitaire'],
                        'unite' => $ligne['unite'] ?? null,
                        'montant' => $ligne['quantite'] * $ligne['prix_unitaire'],
                    ]);
                }
            }

            // Recalculate total
            $ordre->calculateTotal();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ordre de travail created successfully',
                'data' => $ordre->load(['client', 'lignesPrestations']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Failed to create ordre de travail',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateOrdreTravail(Request $request, int $id)
    {
        $ordre = OrdreTravail::find($id);

        if (!$ordre) {
            return response()->json([
                'success' => false,
                'error' => 'Ordre de travail not found',
            ], 404);
        }

        // Prevent updates to completed/invoiced orders
        if (in_array($ordre->status, ['completed', 'invoiced', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot update ordre with status: ' . $ordre->status,
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'type' => 'sometimes|string|max:100',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'booking_number' => 'nullable|string|max:100',
            'bl_number' => 'nullable|string|max:100',
            'vessel_name' => 'nullable|string|max:255',
            'containers' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ordre->update($request->only([
            'date', 'type', 'reference', 'description',
            'booking_number', 'bl_number', 'vessel_name', 'containers',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Ordre de travail updated successfully',
            'data' => $ordre->fresh()->load(['client', 'lignesPrestations']),
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $ordre = OrdreTravail::find($id);

        if (!$ordre) {
            return response()->json([
                'success' => false,
                'error' => 'Ordre de travail not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,validated,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $ordre->status;
        $newStatus = $request->status;

        // Validate status transitions
        $validTransitions = [
            'pending' => ['validated', 'cancelled'],
            'validated' => ['in_progress', 'cancelled'],
            'in_progress' => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => [],
        ];

        if (!in_array($newStatus, $validTransitions[$oldStatus] ?? [])) {
            return response()->json([
                'success' => false,
                'error' => "Invalid status transition from '{$oldStatus}' to '{$newStatus}'",
            ], 422);
        }

        $ordre->update([
            'status' => $newStatus,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Status updated from '{$oldStatus}' to '{$newStatus}'",
            'data' => [
                'id' => $ordre->id,
                'numero' => $ordre->numero,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
        ]);
    }

    public function addNote(Request $request, int $id)
    {
        $ordre = OrdreTravail::find($id);

        if (!$ordre) {
            return response()->json([
                'success' => false,
                'error' => 'Ordre de travail not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'note' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $currentNotes = $ordre->notes ?? '';
        $newNote = "[" . now()->format('Y-m-d H:i') . "] " . $request->note;
        
        $ordre->update([
            'notes' => $currentNotes ? $currentNotes . "\n" . $newNote : $newNote,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Note added successfully',
        ]);
    }

    // ==========================================
    // FACTURES - READ ONLY
    // ==========================================

    public function invoices(Request $request)
    {
        $query = Invoice::with(['client:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $invoices = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $invoices->items(),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    public function showInvoice(int $id)
    {
        $invoice = Invoice::with(['client', 'items'])->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'error' => 'Invoice not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    // ==========================================
    // STATS
    // ==========================================

    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'clients' => [
                    'total' => Client::count(),
                    'active' => Client::where('is_active', true)->count(),
                ],
                'ordres_travail' => [
                    'total' => OrdreTravail::count(),
                    'pending' => OrdreTravail::where('status', 'pending')->count(),
                    'in_progress' => OrdreTravail::where('status', 'in_progress')->count(),
                    'completed' => OrdreTravail::where('status', 'completed')->count(),
                ],
                'invoices' => [
                    'total' => Invoice::count(),
                    'pending' => Invoice::where('status', 'pending')->count(),
                    'paid' => Invoice::where('status', 'paid')->count(),
                ],
            ],
        ]);
    }
}

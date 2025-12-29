<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendingContainer;
use App\Models\OrdreTravail;
use App\Models\Client;
use App\Models\Container;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PendingContainerController extends Controller
{
    /**
     * Récupérer les conteneurs en attente groupés par numéro de booking
     */
    public function index(Request $request)
    {
        $query = PendingContainer::where('status', 'pending');

        // Filtres
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_number', 'like', "%{$search}%")
                    ->orWhere('container_number', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('client_name')) {
            $query->where('client_name', $request->client_name);
        }

        // Récupérer tous les conteneurs en attente
        $containers = $query->orderBy('created_at', 'desc')->get();

        // Grouper par numéro de booking
        $groupedByBooking = $containers->groupBy('booking_number');

        $result = [];
        foreach ($groupedByBooking as $bookingNumber => $containerGroup) {
            $firstContainer = $containerGroup->first();
            
            $result[] = [
                'booking_number' => $bookingNumber,
                'client_name' => $firstContainer->client_name,
                'client_id' => $firstContainer->client_id,
                'vessel_name' => $firstContainer->vessel_name,
                'voyage_number' => $firstContainer->voyage_number,
                'shipping_line' => $firstContainer->shipping_line,
                'port_origin' => $firstContainer->port_origin,
                'port_destination' => $firstContainer->port_destination,
                'eta' => $firstContainer->eta,
                'etd' => $firstContainer->etd,
                'operation_type' => $firstContainer->operation_type ?? 'transport_import',
                'containers' => $containerGroup->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'container_number' => $c->container_number,
                        'container_type' => $c->container_type,
                        'container_size' => $c->container_size,
                        'weight' => $c->weight,
                        'seal_number' => $c->seal_number,
                        'description' => $c->description,
                        'external_id' => $c->external_id,
                        'created_at' => $c->created_at,
                    ];
                })->values(),
                'container_count' => $containerGroup->count(),
                'received_at' => $firstContainer->created_at,
                'source' => $firstContainer->source,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result,
            'total_bookings' => count($result),
            'total_containers' => $containers->count(),
        ]);
    }

    /**
     * Créer un ordre de travail à partir des conteneurs groupés par booking
     */
    public function createOrdreTravail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_number' => 'required|string',
            'client_id' => 'nullable|exists:clients,id',
            'date' => 'nullable|date',
            'type' => 'nullable|string',
            'description' => 'nullable|string',
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

            $bookingNumber = $request->booking_number;

            // Récupérer tous les conteneurs avec ce numéro de booking
            $pendingContainers = PendingContainer::where('booking_number', $bookingNumber)
                ->where('status', 'pending')
                ->get();

            if ($pendingContainers->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Aucun conteneur en attente trouvé pour ce numéro de booking',
                ], 404);
            }

            $firstContainer = $pendingContainers->first();

            // Déterminer le client
            $clientId = $request->client_id;
            if (!$clientId && $firstContainer->client_id) {
                $clientId = $firstContainer->client_id;
            } elseif (!$clientId && $firstContainer->client_name) {
                // Créer ou trouver le client par nom
                $client = Client::firstOrCreate(
                    ['name' => $firstContainer->client_name],
                    ['is_active' => true, 'type' => 'entreprise']
                );
                $clientId = $client->id;
            }

            if (!$clientId) {
                return response()->json([
                    'success' => false,
                    'error' => 'Aucun client spécifié ou trouvé',
                ], 422);
            }

            // Créer l'ordre de travail
            $ordre = OrdreTravail::create([
                'client_id' => $clientId,
                'date' => $request->date ?? now(),
                'type' => $request->type ?? $firstContainer->operation_type ?? 'Transport - Import conteneurs',
                'status' => 'pending',
                'description' => $request->description ?? "Import conteneurs - Booking: {$bookingNumber}",
                'numero_booking' => $bookingNumber,
                'navire' => $firstContainer->vessel_name,
                'compagnie_maritime' => $firstContainer->shipping_line,
                'nombre_conteneurs' => $pendingContainers->count(),
                'source' => 'external_api',
                'external_id' => $firstContainer->external_id,
            ]);

            // Créer les conteneurs liés à l'ordre de travail
            foreach ($pendingContainers as $pc) {
                Container::create([
                    'ordre_travail_id' => $ordre->id,
                    'numero' => $pc->container_number,
                    'type' => $pc->container_type ?? $pc->container_size,
                    'description' => $pc->description,
                ]);

                // Marquer le conteneur en attente comme traité
                $pc->update([
                    'status' => 'processed',
                    'processed_at' => now(),
                    'ordre_travail_id' => $ordre->id,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ordre de travail créé avec succès',
                'data' => [
                    'ordre_travail' => $ordre->load('containers'),
                    'containers_count' => $pendingContainers->count(),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la création de l\'ordre de travail',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Créer plusieurs ordres de travail en lot
     */
    public function bulkCreateOrdresTravail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_numbers' => 'required|array|min:1',
            'booking_numbers.*' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $results = [
            'created' => [],
            'failed' => [],
        ];

        foreach ($request->booking_numbers as $bookingNumber) {
            try {
                DB::beginTransaction();

                $pendingContainers = PendingContainer::where('booking_number', $bookingNumber)
                    ->where('status', 'pending')
                    ->get();

                if ($pendingContainers->isEmpty()) {
                    $results['failed'][] = [
                        'booking_number' => $bookingNumber,
                        'error' => 'Aucun conteneur en attente trouvé',
                    ];
                    continue;
                }

                $firstContainer = $pendingContainers->first();

                // Déterminer le client
                $clientId = $firstContainer->client_id;
                if (!$clientId && $firstContainer->client_name) {
                    $client = Client::firstOrCreate(
                        ['name' => $firstContainer->client_name],
                        ['is_active' => true, 'type' => 'entreprise']
                    );
                    $clientId = $client->id;
                }

                if (!$clientId) {
                    $results['failed'][] = [
                        'booking_number' => $bookingNumber,
                        'error' => 'Aucun client trouvé',
                    ];
                    DB::rollBack();
                    continue;
                }

                $ordre = OrdreTravail::create([
                    'client_id' => $clientId,
                    'date' => now(),
                    'type' => $firstContainer->operation_type ?? 'Transport - Import conteneurs',
                    'status' => 'pending',
                    'description' => "Import conteneurs - Booking: {$bookingNumber}",
                    'numero_booking' => $bookingNumber,
                    'navire' => $firstContainer->vessel_name,
                    'compagnie_maritime' => $firstContainer->shipping_line,
                    'nombre_conteneurs' => $pendingContainers->count(),
                    'source' => 'external_api',
                ]);

                foreach ($pendingContainers as $pc) {
                    Container::create([
                        'ordre_travail_id' => $ordre->id,
                        'numero' => $pc->container_number,
                        'type' => $pc->container_type ?? $pc->container_size,
                        'description' => $pc->description,
                    ]);

                    $pc->update([
                        'status' => 'processed',
                        'processed_at' => now(),
                        'ordre_travail_id' => $ordre->id,
                    ]);
                }

                DB::commit();

                $results['created'][] = [
                    'booking_number' => $bookingNumber,
                    'ordre_travail_id' => $ordre->id,
                    'containers_count' => $pendingContainers->count(),
                ];

            } catch (\Exception $e) {
                DB::rollBack();
                $results['failed'][] = [
                    'booking_number' => $bookingNumber,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $results,
            'summary' => [
                'created_count' => count($results['created']),
                'failed_count' => count($results['failed']),
            ],
        ]);
    }

    /**
     * Supprimer/rejeter des conteneurs en attente
     */
    public function reject(Request $request, string $bookingNumber)
    {
        $containers = PendingContainer::where('booking_number', $bookingNumber)
            ->where('status', 'pending')
            ->get();

        if ($containers->isEmpty()) {
            return response()->json([
                'success' => false,
                'error' => 'Aucun conteneur trouvé pour ce booking',
            ], 404);
        }

        $containers->each(function ($container) use ($request) {
            $container->update([
                'status' => 'rejected',
                'rejected_at' => now(),
                'rejection_reason' => $request->reason ?? null,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Conteneurs rejetés avec succès',
            'count' => $containers->count(),
        ]);
    }

    /**
     * Statistiques des conteneurs en attente
     */
    public function stats()
    {
        $pending = PendingContainer::where('status', 'pending');
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_containers' => $pending->count(),
                'total_bookings' => $pending->distinct('booking_number')->count('booking_number'),
                'by_shipping_line' => PendingContainer::where('status', 'pending')
                    ->selectRaw('shipping_line, count(*) as count')
                    ->groupBy('shipping_line')
                    ->pluck('count', 'shipping_line'),
                'by_operation_type' => PendingContainer::where('status', 'pending')
                    ->selectRaw('operation_type, count(*) as count')
                    ->groupBy('operation_type')
                    ->pluck('count', 'operation_type'),
                'recent_count' => PendingContainer::where('status', 'pending')
                    ->where('created_at', '>=', now()->subDay())
                    ->count(),
            ],
        ]);
    }
}

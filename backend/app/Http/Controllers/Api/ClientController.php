<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientRequest;
use App\Models\Client;
use App\Models\ClientContact;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ClientsExport;

class ClientController extends Controller
{
    /**
     * Liste des clients avec pagination
     */
    public function index(Request $request)
    {
        $query = Client::with('contacts');

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nif', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        
        return $query->paginate($perPage);
    }

    /**
     * Créer un client
     */
    public function store(ClientRequest $request)
    {
        $data = $request->validated();
        $contacts = $data['contacts'] ?? [];
        unset($data['contacts']);

        $client = Client::create($data);

        // Ajouter les contacts
        foreach ($contacts as $contact) {
            $client->contacts()->create($contact);
        }

        return response()->json([
            'success' => true,
            'data' => $client->load('contacts'),
            'message' => 'Client créé avec succès',
        ], 201);
    }

    /**
     * Afficher un client
     */
    public function show(Client $client)
    {
        return response()->json([
            'success' => true,
            'data' => $client->load('contacts'),
        ]);
    }

    /**
     * Mettre à jour un client
     */
    public function update(ClientRequest $request, Client $client)
    {
        $data = $request->validated();
        $contacts = $data['contacts'] ?? null;
        unset($data['contacts']);

        $client->update($data);

        // Mettre à jour les contacts si fournis
        if ($contacts !== null) {
            $client->contacts()->delete();
            foreach ($contacts as $contact) {
                $client->contacts()->create($contact);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $client->fresh()->load('contacts'),
            'message' => 'Client mis à jour avec succès',
        ]);
    }

    /**
     * Supprimer un client
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client supprimé avec succès',
        ], 204);
    }

    /**
     * Rechercher des clients
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');

        $clients = Client::where('name', 'like', "%{$query}%")
            ->orWhere('nif', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    /**
     * Solde d'un client
     */
    public function balance(Client $client)
    {
        $invoices = $client->invoices();
        
        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $invoices->sum('amount') - $invoices->sum('paid'),
                'invoices_count' => $invoices->count(),
            ],
        ]);
    }

    /**
     * Contacts d'un client
     */
    public function contacts(Client $client)
    {
        return response()->json([
            'success' => true,
            'data' => $client->contacts,
        ]);
    }

    /**
     * Ajouter un contact
     */
    public function addContact(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
        ]);

        $contact = $client->contacts()->create($validated);

        return response()->json([
            'success' => true,
            'data' => $contact,
            'message' => 'Contact ajouté',
        ], 201);
    }

    /**
     * Supprimer un contact
     */
    public function deleteContact(Client $client, ClientContact $contact)
    {
        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contact supprimé',
        ], 204);
    }

    /**
     * Exporter les clients
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'xlsx');
        $filename = 'clients_' . date('Y-m-d') . '.' . $format;

        return Excel::download(new ClientsExport, $filename);
    }
}

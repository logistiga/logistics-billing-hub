<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InvoiceRequest;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMail;

class InvoiceController extends Controller
{
    /**
     * Liste des factures avec pagination
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['client', 'items']);

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($request->get('per_page', 15));
    }

    /**
     * Créer une facture
     */
    public function store(InvoiceRequest $request)
    {
        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        // Générer le numéro de facture
        $data['number'] = $this->generateInvoiceNumber();
        $data['amount'] = 0;

        $invoice = Invoice::create($data);

        // Ajouter les lignes
        foreach ($items as $item) {
            $item['total'] = $item['quantity'] * $item['unit_price'];
            $invoice->items()->create($item);
            $invoice->amount += $item['total'];
        }

        $invoice->save();

        return response()->json([
            'success' => true,
            'data' => $invoice->load(['client', 'items']),
            'message' => 'Facture créée avec succès',
        ], 201);
    }

    /**
     * Afficher une facture
     */
    public function show(Invoice $invoice)
    {
        return response()->json([
            'success' => true,
            'data' => $invoice->load(['client', 'items', 'payments']),
        ]);
    }

    /**
     * Mettre à jour une facture
     */
    public function update(InvoiceRequest $request, Invoice $invoice)
    {
        $data = $request->validated();
        $items = $data['items'] ?? null;
        unset($data['items']);

        $invoice->update($data);

        if ($items !== null) {
            $invoice->items()->delete();
            $invoice->amount = 0;
            
            foreach ($items as $item) {
                $item['total'] = $item['quantity'] * $item['unit_price'];
                $invoice->items()->create($item);
                $invoice->amount += $item['total'];
            }
            
            $invoice->save();
        }

        return response()->json([
            'success' => true,
            'data' => $invoice->fresh()->load(['client', 'items']),
            'message' => 'Facture mise à jour',
        ]);
    }

    /**
     * Supprimer une facture
     */
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Facture supprimée',
        ], 204);
    }

    /**
     * Enregistrer un paiement
     */
    public function recordPayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'reference' => 'nullable|string',
            'date' => 'nullable|date',
            'is_advance' => 'boolean',
        ]);

        $payment = $invoice->payments()->create([
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'reference' => $validated['reference'] ?? null,
            'date' => $validated['date'] ?? now(),
            'is_advance' => $validated['is_advance'] ?? false,
        ]);

        // Mettre à jour le statut de la facture
        if ($validated['is_advance'] ?? false) {
            $invoice->advance += $validated['amount'];
        } else {
            $invoice->paid += $validated['amount'];
        }

        $remaining = $invoice->amount - $invoice->paid - $invoice->advance;
        
        if ($remaining <= 0) {
            $invoice->status = 'paid';
        } elseif ($invoice->paid > 0 || $invoice->advance > 0) {
            $invoice->status = 'partial';
        }

        $invoice->save();

        return response()->json([
            'success' => true,
            'data' => $invoice->fresh()->load(['client', 'items']),
            'message' => 'Paiement enregistré',
        ]);
    }

    /**
     * Paiement groupé
     */
    public function groupPayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_ids' => 'required|array|min:2',
            'invoice_ids.*' => 'exists:invoices,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
        ]);

        $invoices = Invoice::whereIn('id', $validated['invoice_ids'])->get();
        $totalAmount = $validated['amount'];

        foreach ($invoices as $invoice) {
            $remaining = $invoice->amount - $invoice->paid - $invoice->advance;
            $paymentAmount = min($remaining, $totalAmount);

            if ($paymentAmount > 0) {
                $invoice->payments()->create([
                    'amount' => $paymentAmount,
                    'payment_method' => $validated['payment_method'],
                    'date' => now(),
                ]);

                $invoice->paid += $paymentAmount;
                $totalAmount -= $paymentAmount;

                if ($invoice->amount - $invoice->paid - $invoice->advance <= 0) {
                    $invoice->status = 'paid';
                } else {
                    $invoice->status = 'partial';
                }

                $invoice->save();
            }

            if ($totalAmount <= 0) break;
        }

        return response()->json([
            'success' => true,
            'data' => $invoices->fresh(),
            'message' => 'Paiement groupé enregistré',
        ]);
    }

    /**
     * Statistiques
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Invoice::count(),
                'paid' => Invoice::where('status', 'paid')->count(),
                'pending' => Invoice::whereIn('status', ['pending', 'partial'])->count(),
                'overdue' => Invoice::where('status', 'overdue')->count(),
                'total_amount' => Invoice::sum('amount'),
                'paid_amount' => Invoice::sum('paid'),
                'pending_amount' => Invoice::selectRaw('SUM(amount - paid - advance) as pending')->value('pending') ?? 0,
            ],
        ]);
    }

    /**
     * Factures en retard
     */
    public function overdue()
    {
        $invoices = Invoice::where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->whereIn('status', ['pending', 'partial'])
                  ->where('due_date', '<', now());
            })
            ->with('client')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Télécharger le PDF
     */
    public function downloadPdf(Invoice $invoice)
    {
        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice->load(['client', 'items']),
        ]);

        return $pdf->download("facture_{$invoice->number}.pdf");
    }

    /**
     * Envoyer par email
     */
    public function sendByEmail(Request $request, Invoice $invoice)
    {
        $email = $request->email ?? $invoice->client->email;

        Mail::to($email)->send(new InvoiceMail($invoice));

        return response()->json([
            'success' => true,
            'message' => 'Facture envoyée par email',
        ]);
    }

    /**
     * Générer un numéro de facture
     */
    private function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $lastInvoice = Invoice::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice 
            ? (int) substr($lastInvoice->number, -4) + 1 
            : 1;

        return sprintf('FAC-%s-%04d', $year, $sequence);
    }
}

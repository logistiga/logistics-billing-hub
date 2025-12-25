@extends('emails.layout')

@section('title', 'Confirmation de paiement')

@section('content')
    <h2>Paiement reçu ✓</h2>
    
    <p>Bonjour {{ $client->name ?? 'Cher client' }},</p>
    
    <p>Nous avons bien reçu votre paiement. Voici le récapitulatif:</p>
    
    <div class="info-box success">
        <strong>Montant reçu:</strong>
        <span class="amount">{{ number_format($payment->amount, 2, ',', ' ') }} GNF</span>
    </div>
    
    <table class="table">
        <tr>
            <th>Facture</th>
            <td>{{ $invoice->numero }}</td>
        </tr>
        <tr>
            <th>Date de paiement</th>
            <td>{{ $payment->payment_date?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <th>Mode de paiement</th>
            <td>
                @switch($payment->payment_method)
                    @case('cash') Espèces @break
                    @case('bank_transfer') Virement bancaire @break
                    @case('check') Chèque @break
                    @case('card') Carte bancaire @break
                    @default {{ $payment->payment_method }}
                @endswitch
            </td>
        </tr>
        @if($payment->reference)
        <tr>
            <th>Référence</th>
            <td>{{ $payment->reference }}</td>
        </tr>
        @endif
    </table>
    
    <div class="divider"></div>
    
    <h3>État de la facture</h3>
    <table class="table">
        <tr>
            <th>Montant total</th>
            <td style="text-align: right;">{{ number_format($invoice->total, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>Total payé</th>
            <td style="text-align: right;">{{ number_format($invoice->amount_paid, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>Reste à payer</th>
            <td style="text-align: right;">
                @if($invoice->total - $invoice->amount_paid <= 0)
                    <span style="color: #10b981; font-weight: bold;">Soldée ✓</span>
                @else
                    {{ number_format($invoice->total - $invoice->amount_paid, 2, ',', ' ') }} GNF
                @endif
            </td>
        </tr>
    </table>
    
    <p>Merci pour votre confiance.</p>
    
    <p>Cordialement,<br><strong>L'équipe LogistiGa</strong></p>
@endsection

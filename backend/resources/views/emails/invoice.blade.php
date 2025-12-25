@extends('emails.layout')

@section('title', 'Facture ' . $invoice->numero)

@section('content')
    <h2>Facture {{ $invoice->numero }}</h2>
    
    <p>Bonjour {{ $client->name ?? 'Cher client' }},</p>
    
    @if($customMessage)
        <div class="info-box">
            {{ $customMessage }}
        </div>
    @else
        <p>Veuillez trouver ci-joint votre facture.</p>
    @endif
    
    <table class="table">
        <tr>
            <th>Numéro de facture</th>
            <td>{{ $invoice->numero }}</td>
        </tr>
        <tr>
            <th>Date</th>
            <td>{{ $invoice->date?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <th>Date d'échéance</th>
            <td>{{ $invoice->due_date?->format('d/m/Y') }}</td>
        </tr>
        @if($invoice->reference)
        <tr>
            <th>Référence</th>
            <td>{{ $invoice->reference }}</td>
        </tr>
        @endif
    </table>
    
    <div class="divider"></div>
    
    <table class="table">
        <tr>
            <th>Sous-total HT</th>
            <td style="text-align: right;">{{ number_format($invoice->subtotal, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>TVA ({{ $invoice->tax_rate }}%)</th>
            <td style="text-align: right;">{{ number_format($invoice->tax_amount, 2, ',', ' ') }} GNF</td>
        </tr>
        @if($invoice->discount_amount > 0)
        <tr>
            <th>Remise</th>
            <td style="text-align: right;">-{{ number_format($invoice->discount_amount, 2, ',', ' ') }} GNF</td>
        </tr>
        @endif
        <tr>
            <th>Total TTC</th>
            <td style="text-align: right;"><span class="amount">{{ number_format($invoice->total, 2, ',', ' ') }} GNF</span></td>
        </tr>
    </table>
    
    <div class="info-box">
        <strong>Modalités de paiement:</strong><br>
        Merci de procéder au règlement avant le {{ $invoice->due_date?->format('d/m/Y') }}.
    </div>
    
    <p style="text-align: center;">
        <a href="{{ config('app.frontend_url') }}/factures/{{ $invoice->id }}" class="btn">
            Voir la facture en ligne
        </a>
    </p>
    
    <p>Cordialement,<br><strong>L'équipe LogistiGa</strong></p>
@endsection

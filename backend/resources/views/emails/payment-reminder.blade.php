@extends('emails.layout')

@section('title', 'Rappel de paiement')

@section('content')
    @if($daysOverdue > 0)
        <h2 style="color: #dc2626;">⚠️ Facture en retard</h2>
    @else
        <h2>Rappel de paiement</h2>
    @endif
    
    <p>Bonjour {{ $client->name ?? 'Cher client' }},</p>
    
    @if($daysOverdue > 0)
        <div class="info-box warning">
            <strong>Votre facture {{ $invoice->numero }} est en retard de {{ $daysOverdue }} jour(s).</strong>
        </div>
        <p>Nous vous prions de bien vouloir procéder au règlement dans les meilleurs délais.</p>
    @else
        <p>Nous vous rappelons que votre facture arrive à échéance prochainement.</p>
    @endif
    
    <table class="table">
        <tr>
            <th>Numéro de facture</th>
            <td>{{ $invoice->numero }}</td>
        </tr>
        <tr>
            <th>Date de la facture</th>
            <td>{{ $invoice->date?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <th>Date d'échéance</th>
            <td style="{{ $daysOverdue > 0 ? 'color: #dc2626; font-weight: bold;' : '' }}">
                {{ $invoice->due_date?->format('d/m/Y') }}
            </td>
        </tr>
        <tr>
            <th>Montant total</th>
            <td>{{ number_format($invoice->total, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>Déjà payé</th>
            <td>{{ number_format($invoice->amount_paid, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>Reste à payer</th>
            <td><span class="amount">{{ number_format($amountDue, 2, ',', ' ') }} GNF</span></td>
        </tr>
    </table>
    
    <p style="text-align: center;">
        <a href="{{ config('app.frontend_url') }}/factures/{{ $invoice->id }}" class="btn">
            Voir la facture
        </a>
    </p>
    
    <div class="info-box">
        <strong>Modes de paiement acceptés:</strong><br>
        • Virement bancaire<br>
        • Chèque<br>
        • Espèces
    </div>
    
    <p>Si vous avez déjà effectué ce paiement, veuillez ignorer ce message.</p>
    
    <p>Pour toute question, n'hésitez pas à nous contacter.</p>
    
    <p>Cordialement,<br><strong>L'équipe LogistiGa</strong></p>
@endsection

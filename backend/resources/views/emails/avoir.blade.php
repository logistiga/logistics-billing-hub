@extends('emails.layout')

@section('title', 'Avoir ' . $avoir->numero)

@section('content')
    <h2>Avoir {{ $avoir->numero }}</h2>
    
    <p>Bonjour {{ $client->name ?? 'Cher client' }},</p>
    
    <p>Veuillez trouver ci-joint votre avoir.</p>
    
    <div class="info-box">
        <strong>Motif:</strong>
        @switch($avoir->reason)
            @case('retour') Retour marchandise @break
            @case('remise') Remise commerciale @break
            @case('erreur_facturation') Erreur de facturation @break
            @case('annulation') Annulation @break
            @default {{ $avoir->reason }}
        @endswitch
    </div>
    
    <table class="table">
        <tr>
            <th>Numéro d'avoir</th>
            <td>{{ $avoir->numero }}</td>
        </tr>
        @if($avoir->invoice)
        <tr>
            <th>Facture liée</th>
            <td>{{ $avoir->invoice->numero }}</td>
        </tr>
        @endif
        <tr>
            <th>Date</th>
            <td>{{ $avoir->date?->format('d/m/Y') }}</td>
        </tr>
    </table>
    
    <div class="divider"></div>
    
    <table class="table">
        <tr>
            <th>Sous-total HT</th>
            <td style="text-align: right;">{{ number_format($avoir->subtotal, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>TVA</th>
            <td style="text-align: right;">{{ number_format($avoir->tax_amount, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>Total de l'avoir</th>
            <td style="text-align: right;"><span class="amount">{{ number_format($avoir->total, 2, ',', ' ') }} GNF</span></td>
        </tr>
    </table>
    
    <div class="info-box success">
        <strong>Utilisation:</strong><br>
        Ce montant sera déduit de vos prochaines factures ou peut être remboursé sur demande.
    </div>
    
    <p>Pour toute question, n'hésitez pas à nous contacter.</p>
    
    <p>Cordialement,<br><strong>L'équipe LogistiGa</strong></p>
@endsection

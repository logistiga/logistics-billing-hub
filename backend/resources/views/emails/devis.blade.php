@extends('emails.layout')

@section('title', 'Devis ' . $devis->numero)

@section('content')
    <h2>Devis {{ $devis->numero }}</h2>
    
    <p>Bonjour {{ $client->name ?? 'Cher client' }},</p>
    
    @if($customMessage)
        <div class="info-box">
            {{ $customMessage }}
        </div>
    @else
        <p>Veuillez trouver ci-joint notre proposition commerciale.</p>
    @endif
    
    @if($devis->subject)
        <div class="info-box">
            <strong>Objet:</strong> {{ $devis->subject }}
        </div>
    @endif
    
    <table class="table">
        <tr>
            <th>Numéro de devis</th>
            <td>{{ $devis->numero }}</td>
        </tr>
        <tr>
            <th>Date</th>
            <td>{{ $devis->date?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <th>Valide jusqu'au</th>
            <td>{{ $devis->validity_date?->format('d/m/Y') }}</td>
        </tr>
    </table>
    
    <div class="divider"></div>
    
    <table class="table">
        <tr>
            <th>Sous-total HT</th>
            <td style="text-align: right;">{{ number_format($devis->subtotal, 2, ',', ' ') }} GNF</td>
        </tr>
        <tr>
            <th>TVA</th>
            <td style="text-align: right;">{{ number_format($devis->tax_amount, 2, ',', ' ') }} GNF</td>
        </tr>
        @if($devis->discount_amount > 0)
        <tr>
            <th>Remise</th>
            <td style="text-align: right;">-{{ number_format($devis->discount_amount, 2, ',', ' ') }} GNF</td>
        </tr>
        @endif
        <tr>
            <th>Total TTC</th>
            <td style="text-align: right;"><span class="amount">{{ number_format($devis->total, 2, ',', ' ') }} GNF</span></td>
        </tr>
    </table>
    
    <div class="info-box warning">
        <strong>⚠️ Attention:</strong> Ce devis est valable jusqu'au {{ $devis->validity_date?->format('d/m/Y') }}.
        Passé cette date, les tarifs sont susceptibles d'être modifiés.
    </div>
    
    <p style="text-align: center;">
        <a href="{{ config('app.frontend_url') }}/devis/{{ $devis->id }}" class="btn">
            Voir le devis en ligne
        </a>
    </p>
    
    <p>N'hésitez pas à nous contacter pour toute question.</p>
    
    <p>Cordialement,<br><strong>L'équipe LogistiGa</strong></p>
@endsection

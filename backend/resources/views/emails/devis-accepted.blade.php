@extends('emails.layout')

@section('title', 'Devis accepté')

@section('content')
    <h2 style="color: #10b981;">✓ Devis accepté</h2>
    
    <p>Bonjour,</p>
    
    <div class="info-box success">
        <strong>Bonne nouvelle!</strong> Le client <strong>{{ $client->name }}</strong> 
        a accepté le devis {{ $devis->numero }}.
    </div>
    
    <table class="table">
        <tr>
            <th>Numéro de devis</th>
            <td>{{ $devis->numero }}</td>
        </tr>
        <tr>
            <th>Client</th>
            <td>{{ $client->name }}</td>
        </tr>
        <tr>
            <th>Date d'acceptation</th>
            <td>{{ $devis->accepted_at?->format('d/m/Y H:i') ?? now()->format('d/m/Y H:i') }}</td>
        </tr>
        <tr>
            <th>Montant total</th>
            <td><span class="amount">{{ number_format($devis->total, 2, ',', ' ') }} GNF</span></td>
        </tr>
    </table>
    
    <div class="divider"></div>
    
    <h3>Prochaines étapes</h3>
    <ol>
        <li>Convertir le devis en facture</li>
        <li>Planifier l'exécution des prestations</li>
        <li>Envoyer la facture au client</li>
    </ol>
    
    <p style="text-align: center;">
        <a href="{{ config('app.frontend_url') }}/devis/{{ $devis->id }}" class="btn">
            Voir le devis
        </a>
    </p>
    
    <p>Cordialement,<br><strong>Système LogistiGa</strong></p>
@endsection

@extends('emails.layout')

@section('title', 'Ordre de travail terminé')

@section('content')
    <h2 style="color: #10b981;">✓ Ordre de travail terminé</h2>
    
    <p>Bonjour {{ $client->name ?? 'Cher client' }},</p>
    
    <div class="info-box success">
        <strong>Votre ordre de travail {{ $ordre->numero }} a été complété avec succès.</strong>
    </div>
    
    <table class="table">
        <tr>
            <th>Numéro</th>
            <td>{{ $ordre->numero }}</td>
        </tr>
        <tr>
            <th>Type d'opération</th>
            <td>
                @switch($ordre->type_operation)
                    @case('import') Import @break
                    @case('export') Export @break
                    @case('transit') Transit @break
                    @case('stockage') Stockage @break
                    @default {{ $ordre->type_operation }}
                @endswitch
            </td>
        </tr>
        @if($ordre->bl_numero)
        <tr>
            <th>N° BL</th>
            <td>{{ $ordre->bl_numero }}</td>
        </tr>
        @endif
        @if($ordre->conteneur_numero)
        <tr>
            <th>N° Conteneur</th>
            <td>{{ $ordre->conteneur_numero }}</td>
        </tr>
        @endif
        @if($ordre->navire)
        <tr>
            <th>Navire</th>
            <td>{{ $ordre->navire }}</td>
        </tr>
        @endif
        <tr>
            <th>Date de création</th>
            <td>{{ $ordre->date?->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <th>Date d'exécution</th>
            <td>{{ $ordre->date_execution?->format('d/m/Y') ?? now()->format('d/m/Y') }}</td>
        </tr>
    </table>
    
    <div class="divider"></div>
    
    <p>Une facture vous sera envoyée prochainement pour les prestations réalisées.</p>
    
    <p style="text-align: center;">
        <a href="{{ config('app.frontend_url') }}/ordres-travail/{{ $ordre->id }}" class="btn">
            Voir les détails
        </a>
    </p>
    
    <p>Merci de votre confiance.</p>
    
    <p>Cordialement,<br><strong>L'équipe LogistiGa</strong></p>
@endsection

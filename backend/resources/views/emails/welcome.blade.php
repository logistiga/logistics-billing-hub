@extends('emails.layout')

@section('title', 'Bienvenue sur LogistiGa')

@section('content')
    <h2>Bienvenue {{ $user->name }} !</h2>
    
    <p>Votre compte LogistiGa a été créé avec succès.</p>
    
    <div class="info-box success">
        <strong>Vos informations de connexion:</strong><br><br>
        <strong>Email:</strong> {{ $user->email }}<br>
        @if($temporaryPassword)
            <strong>Mot de passe temporaire:</strong> {{ $temporaryPassword }}
        @endif
    </div>
    
    @if($temporaryPassword)
        <div class="info-box warning">
            <strong>⚠️ Important:</strong> Pour des raisons de sécurité, nous vous recommandons de 
            changer votre mot de passe dès votre première connexion.
        </div>
    @endif
    
    <p style="text-align: center;">
        <a href="{{ $loginUrl }}" class="btn">
            Se connecter à LogistiGa
        </a>
    </p>
    
    <div class="divider"></div>
    
    <h3>Prochaines étapes</h3>
    <ul>
        <li>Connectez-vous à votre espace personnel</li>
        <li>Complétez votre profil</li>
        <li>Explorez les fonctionnalités de la plateforme</li>
    </ul>
    
    <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe support.</p>
    
    <p>Bienvenue dans l'équipe !<br><strong>LogistiGa</strong></p>
@endsection

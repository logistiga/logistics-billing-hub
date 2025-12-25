@extends('emails.layout')

@section('title', 'Réinitialisation de mot de passe')

@section('content')
    <h2>Réinitialisation de mot de passe</h2>
    
    <p>Bonjour {{ $user->name }},</p>
    
    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte LogistiGa.</p>
    
    <p style="text-align: center;">
        <a href="{{ $resetUrl }}" class="btn">
            Réinitialiser mon mot de passe
        </a>
    </p>
    
    <div class="info-box warning">
        <strong>⚠️ Important:</strong><br>
        • Ce lien est valable pendant 60 minutes.<br>
        • Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.<br>
        • Votre mot de passe actuel reste inchangé tant que vous n'utilisez pas ce lien.
    </div>
    
    <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:</p>
    <p style="word-break: break-all; font-size: 12px; color: #6b7280;">
        {{ $resetUrl }}
    </p>
    
    <div class="divider"></div>
    
    <p style="font-size: 12px; color: #6b7280;">
        Pour des raisons de sécurité, nous ne pouvons pas envoyer votre mot de passe actuel. 
        Si vous rencontrez des difficultés, contactez notre support.
    </p>
    
    <p>Cordialement,<br><strong>L'équipe LogistiGa</strong></p>
@endsection

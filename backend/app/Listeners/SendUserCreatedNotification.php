<?php

namespace App\Listeners;

use App\Events\UserCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendUserCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(UserCreated $event): void
    {
        $user = $event->user;
        
        Log::info('New user created', [
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);

        // TODO: Send welcome email with credentials
        // Mail::to($user->email)->send(new WelcomeMail($user, $event->temporaryPassword));
    }
}

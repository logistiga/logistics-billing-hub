<?php

namespace App\Listeners;

use App\Events\ClientCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class LogClientCreated implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(ClientCreated $event): void
    {
        $client = $event->client;
        
        Log::info('New client created', [
            'client_id' => $client->id,
            'name' => $client->name,
            'email' => $client->email,
            'city' => $client->city,
        ]);

        // TODO: Notify sales team about new client
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ordres_travail', function (Blueprint $table) {
            // Champs booking pour intégration externe
            $table->string('numero_booking')->unique()->nullable()->after('numero');
            $table->string('numero_connaissement')->nullable()->after('numero_booking');
            
            // Infos navire et compagnie
            $table->string('navire')->nullable()->change();
            $table->string('compagnie_maritime')->nullable()->after('navire');
            $table->string('transitaire')->nullable()->after('compagnie_maritime');
            
            // Comptage conteneurs
            $table->integer('nombre_conteneurs')->default(0)->after('transitaire');
            
            // Primes au niveau ordre
            $table->decimal('prime_transitaire', 15, 2)->default(0)->after('nombre_conteneurs');
            $table->decimal('prime_representant', 15, 2)->default(0)->after('prime_transitaire');
            
            // Champs pour intégration externe
            $table->enum('source', ['internal', 'external'])->default('internal')->after('status');
            $table->string('external_id')->nullable()->after('source');
            $table->timestamp('synced_at')->nullable()->after('external_id');
            
            // Index pour performance
            $table->index('numero_booking');
            $table->index('external_id');
            $table->index(['source', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ordres_travail', function (Blueprint $table) {
            $table->dropIndex(['numero_booking']);
            $table->dropIndex(['external_id']);
            $table->dropIndex(['source', 'status']);
            
            $table->dropColumn([
                'numero_booking',
                'numero_connaissement',
                'compagnie_maritime',
                'transitaire',
                'nombre_conteneurs',
                'prime_transitaire',
                'prime_representant',
                'source',
                'external_id',
                'synced_at',
            ]);
        });
    }
};

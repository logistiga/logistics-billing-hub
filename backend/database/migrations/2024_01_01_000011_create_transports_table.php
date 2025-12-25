<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ordre_travail_id')->constrained('ordres_travail')->onDelete('cascade');
            $table->string('type');
            $table->string('vehicule')->nullable();
            $table->string('immatriculation')->nullable();
            $table->string('chauffeur')->nullable();
            $table->string('depart')->nullable();
            $table->string('arrivee')->nullable();
            $table->date('date_depart')->nullable();
            $table->date('date_arrivee')->nullable();
            $table->decimal('distance_km', 10, 2)->nullable();
            $table->decimal('prix', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('lignes_prestations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ordre_travail_id')->constrained('ordres_travail')->onDelete('cascade');
            $table->text('description');
            $table->decimal('quantite', 10, 2)->default(1);
            $table->decimal('prix_unitaire', 15, 2)->default(0);
            $table->string('unite')->default('unité');
            $table->decimal('tva_rate', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lignes_prestations');
        Schema::dropIfExists('transports');
    }
};

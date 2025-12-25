<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compagnies_maritimes', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('num_tc')->nullable(); // Type conteneur: 20, 40, Frigo
            $table->decimal('prix', 15, 2)->default(0);
            $table->integer('jours')->default(0); // Jours de franchise
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compagnies_maritimes');
    }
};

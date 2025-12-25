<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordre_travail_taxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ordre_travail_id')->constrained('ordres_travail')->onDelete('cascade');
            $table->foreignId('tax_id')->constrained('taxes')->onDelete('cascade');
            $table->decimal('rate', 5, 2); // Taux au moment de la création
            $table->decimal('amount', 15, 2)->default(0); // Montant de la taxe
            $table->timestamps();

            $table->unique(['ordre_travail_id', 'tax_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordre_travail_taxes');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transitaires', function (Blueprint $table) {
            $table->id();
            $table->string('compagnie');
            $table->string('nom');
            $table->string('tel')->nullable();
            $table->string('email')->nullable();
            $table->string('adresse')->nullable();
            $table->decimal('solde', 15, 2)->default(0); // Solde courant
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transitaires');
    }
};

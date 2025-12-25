<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordres_travail', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('type', ['Transport', 'Manutention', 'Stockage', 'Location'])->default('Transport');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'date']);
            $table->index('client_id');
        });

        Schema::create('containers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ordre_travail_id')->constrained('ordres_travail')->onDelete('cascade');
            $table->string('numero');
            $table->string('type')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('containers');
        Schema::dropIfExists('ordres_travail');
    }
};

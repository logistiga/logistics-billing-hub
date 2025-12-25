<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes_debut', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['ouverture_port', 'detention', 'reparation']);
            $table->json('ordres_travail')->nullable();
            $table->string('bl_number');
            $table->string('container_number');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->integer('nombre_jours')->default(0);
            $table->decimal('tarif_journalier', 15, 2);
            $table->decimal('montant_total', 15, 2);
            $table->decimal('paid', 15, 2)->default(0);
            $table->decimal('advance', 15, 2)->default(0);
            $table->enum('status', ['pending', 'invoiced', 'paid', 'cancelled', 'partial'])->default('pending');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'type']);
            $table->index('client_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes_debut');
    }
};

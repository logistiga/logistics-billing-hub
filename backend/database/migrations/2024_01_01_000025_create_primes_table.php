<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Primes représentants
        Schema::create('primes_representants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('representant_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('montant', 15, 2);
            $table->date('date');
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->date('date_paiement')->nullable();
            $table->timestamps();
        });

        // Paiements transitaires
        Schema::create('paiements_transitaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transitaire_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('montant', 15, 2);
            $table->date('date');
            $table->enum('type', ['debit', 'credit'])->default('debit'); // debit = paiement, credit = facturation
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements_transitaires');
        Schema::dropIfExists('primes_representants');
    }
};

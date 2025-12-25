<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partenaires', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['fournisseur', 'sous-traitant', 'transporteur', 'autre'])->default('fournisseur');
            $table->string('contact_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('France');
            $table->string('siret')->nullable();
            $table->string('tva_number')->nullable();
            $table->string('iban')->nullable();
            $table->string('bic')->nullable();
            $table->decimal('balance', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('partenaire_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partenaire_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['facture', 'paiement', 'avoir', 'autre']);
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partenaire_transactions');
        Schema::dropIfExists('partenaires');
    }
};

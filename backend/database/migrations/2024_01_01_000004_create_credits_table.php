<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credits', function (Blueprint $table) {
            $table->id();
            $table->string('bank');
            $table->string('reference')->unique();
            $table->decimal('capital_initial', 15, 2);
            $table->decimal('capital_restant', 15, 2);
            $table->decimal('taux_interet', 5, 2);
            $table->decimal('mensualite', 15, 2);
            $table->date('date_debut');
            $table->date('date_fin');
            $table->integer('duree_total');
            $table->integer('echeances_payees')->default(0);
            $table->enum('status', ['active', 'overdue', 'completed', 'suspended'])->default('active');
            $table->date('prochain_paiement');
            $table->string('objet_credit');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'prochain_paiement']);
        });

        Schema::create('credit_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('credit_id')->constrained()->onDelete('cascade');
            $table->string('credit_ref');
            $table->string('bank');
            $table->date('date');
            $table->decimal('montant', 15, 2);
            $table->decimal('capital', 15, 2);
            $table->decimal('interet', 15, 2);
            $table->enum('status', ['paid', 'pending', 'overdue'])->default('pending');
            $table->integer('echeance');
            $table->timestamps();
            
            $table->index(['credit_id', 'echeance']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_payments');
        Schema::dropIfExists('credits');
    }
};

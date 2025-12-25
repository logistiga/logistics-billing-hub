<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('banque_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('client_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('partenaire_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['credit', 'debit']);
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->date('value_date')->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_reconciled')->default(false);
            $table->date('reconciled_at')->nullable();
            $table->text('reconciliation_note')->nullable();
            $table->boolean('is_cancelled')->default(false);
            $table->timestamps();

            $table->index(['banque_id', 'date']);
            $table->index(['is_reconciled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

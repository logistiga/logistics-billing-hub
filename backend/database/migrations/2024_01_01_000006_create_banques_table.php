<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banques', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('account_number')->unique();
            $table->string('iban')->nullable();
            $table->string('swift')->nullable();
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('currency', 10)->default('XAF');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['credit', 'debit']);
            $table->decimal('amount', 15, 2);
            $table->string('description');
            $table->string('reference')->nullable();
            $table->date('date');
            $table->foreignId('bank_id')->nullable()->constrained('banques')->onDelete('set null');
            $table->string('category');
            $table->enum('status', ['completed', 'pending', 'cancelled'])->default('completed');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['bank_id', 'date']);
            $table->index(['type', 'status']);
        });

        Schema::create('avoirs', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->decimal('amount', 15, 2);
            $table->decimal('remaining_amount', 15, 2);
            $table->string('reason');
            $table->enum('status', ['pending', 'applied', 'cancelled'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'client_id']);
        });

        Schema::create('avoir_compensations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('avoir_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avoir_compensations');
        Schema::dropIfExists('avoirs');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('banques');
    }
};

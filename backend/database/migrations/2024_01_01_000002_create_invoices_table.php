<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->date('due_date');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('paid', 15, 2)->default(0);
            $table->decimal('advance', 15, 2)->default(0);
            $table->enum('status', ['pending', 'partial', 'paid', 'overdue', 'advance', 'cancelled'])->default('pending');
            $table->enum('type', ['Manutention', 'Transport', 'Stockage', 'Location'])->default('Transport');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'due_date']);
            $table->index('client_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};

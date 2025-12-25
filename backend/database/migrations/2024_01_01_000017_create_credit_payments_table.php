<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('credit_id')->constrained()->onDelete('cascade');
            $table->foreignId('banque_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->decimal('principal', 15, 2)->default(0);
            $table->decimal('interest', 15, 2)->default(0);
            $table->date('date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending', 'paid', 'late'])->default('pending');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_payments');
    }
};

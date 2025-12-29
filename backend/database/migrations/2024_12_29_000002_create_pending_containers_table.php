<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_containers', function (Blueprint $table) {
            $table->id();
            
            // Booking information (clé de groupement)
            $table->string('booking_number')->index();
            
            // Container information
            $table->string('container_number');
            $table->string('container_type')->nullable(); // 20GP, 40HC, etc.
            $table->string('container_size')->nullable(); // 20, 40, 45
            $table->decimal('weight', 12, 2)->nullable();
            $table->string('seal_number')->nullable();
            $table->text('description')->nullable();
            
            // Client information
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->string('client_name')->nullable();
            
            // Vessel / Voyage information
            $table->string('vessel_name')->nullable();
            $table->string('voyage_number')->nullable();
            $table->string('shipping_line')->nullable();
            $table->string('port_origin')->nullable();
            $table->string('port_destination')->nullable();
            $table->timestamp('eta')->nullable();
            $table->timestamp('etd')->nullable();
            
            // Operation type
            $table->string('operation_type')->default('transport_import');
            
            // Status tracking
            $table->enum('status', ['pending', 'processed', 'rejected'])->default('pending');
            $table->string('source')->default('external_api');
            $table->string('external_id')->nullable()->index();
            
            // Processing info
            $table->foreignId('ordre_travail_id')->nullable()->constrained('ordres_travail')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();
            
            // Index composite pour recherche rapide
            $table->index(['booking_number', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_containers');
    }
};

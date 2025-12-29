<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nom descriptif de la clé
            $table->string('key', 64)->unique(); // Clé hashée
            $table->string('prefix', 8); // Préfixe visible (ex: "sk_live_")
            $table->json('permissions')->nullable(); // Permissions accordées
            $table->integer('rate_limit')->default(60); // Requêtes par minute
            $table->timestamp('expires_at')->nullable(); // Date d'expiration
            $table->timestamp('last_used_at')->nullable(); // Dernière utilisation
            $table->string('last_used_ip')->nullable(); // IP dernière utilisation
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'expires_at']);
            $table->index('prefix');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};

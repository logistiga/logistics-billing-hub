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
        Schema::table('notes_debut', function (Blueprint $table) {
            $table->foreignId('ordre_travail_id')
                ->nullable()
                ->after('client_id')
                ->constrained('ordres_travail')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes_debut', function (Blueprint $table) {
            $table->dropForeign(['ordre_travail_id']);
            $table->dropColumn('ordre_travail_id');
        });
    }
};

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
        Schema::table('ordres_travail', function (Blueprint $table) {
            // Rendre la colonne number nullable si elle existe
            if (Schema::hasColumn('ordres_travail', 'number')) {
                $table->string('number')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Pas de rollback nécessaire
    }
};

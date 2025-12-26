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
        Schema::table('lignes_prestations', function (Blueprint $table) {
            // Type d'opération pour le reporting
            $table->string('type_operation')->nullable()->after('ordre_travail_id');
            $table->string('sous_type')->nullable()->after('type_operation');
            
            // Localisation pour transport
            $table->string('point_depart')->nullable()->after('sous_type');
            $table->string('point_arrivee')->nullable()->after('point_depart');
            
            // Dates pour stockage/location
            $table->date('date_debut')->nullable()->after('point_arrivee');
            $table->date('date_fin')->nullable()->after('date_debut');
            
            // Index pour reporting par type
            $table->index('type_operation');
            $table->index('sous_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lignes_prestations', function (Blueprint $table) {
            $table->dropIndex(['type_operation']);
            $table->dropIndex(['sous_type']);
            
            $table->dropColumn([
                'type_operation',
                'sous_type',
                'point_depart',
                'point_arrivee',
                'date_debut',
                'date_fin',
            ]);
        });
    }
};

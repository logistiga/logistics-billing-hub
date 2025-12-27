<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notes_debut', function (Blueprint $table) {
            // Supprimer les anciennes colonnes si elles existent
            if (Schema::hasColumn('notes_debut', 'bl_number')) {
                $table->dropColumn('bl_number');
            }
            if (Schema::hasColumn('notes_debut', 'container_number')) {
                $table->dropColumn('container_number');
            }
            if (Schema::hasColumn('notes_debut', 'date_debut')) {
                $table->dropColumn('date_debut');
            }
            if (Schema::hasColumn('notes_debut', 'date_fin')) {
                $table->dropColumn('date_fin');
            }
            if (Schema::hasColumn('notes_debut', 'nombre_jours')) {
                $table->dropColumn('nombre_jours');
            }
            if (Schema::hasColumn('notes_debut', 'tarif_journalier')) {
                $table->dropColumn('tarif_journalier');
            }
            if (Schema::hasColumn('notes_debut', 'montant_total')) {
                $table->dropColumn('montant_total');
            }
            if (Schema::hasColumn('notes_debut', 'paid')) {
                $table->dropColumn('paid');
            }
            if (Schema::hasColumn('notes_debut', 'advance')) {
                $table->dropColumn('advance');
            }
        });

        Schema::table('notes_debut', function (Blueprint $table) {
            // Ajouter les nouvelles colonnes pour le schéma attendu
            if (!Schema::hasColumn('notes_debut', 'conteneur')) {
                $table->string('conteneur')->nullable()->after('ordre_travail_id');
            }
            if (!Schema::hasColumn('notes_debut', 'date_arrivee')) {
                $table->date('date_arrivee')->nullable()->after('conteneur');
            }
            if (!Schema::hasColumn('notes_debut', 'date_sortie')) {
                $table->date('date_sortie')->nullable()->after('date_arrivee');
            }
            if (!Schema::hasColumn('notes_debut', 'jours_detention')) {
                $table->integer('jours_detention')->default(0)->after('date_sortie');
            }
            if (!Schema::hasColumn('notes_debut', 'montant_detention')) {
                $table->decimal('montant_detention', 15, 2)->default(0)->after('jours_detention');
            }
            if (!Schema::hasColumn('notes_debut', 'details')) {
                $table->json('details')->nullable()->after('montant_detention');
            }
            if (!Schema::hasColumn('notes_debut', 'numero')) {
                $table->string('numero')->nullable()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('notes_debut', function (Blueprint $table) {
            $table->dropColumn(['conteneur', 'date_arrivee', 'date_sortie', 'jours_detention', 'montant_detention']);
        });
    }
};

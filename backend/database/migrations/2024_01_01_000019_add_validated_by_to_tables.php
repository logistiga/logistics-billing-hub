<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add user_id to ordres_travail for validated_by
        Schema::table('ordres_travail', function (Blueprint $table) {
            if (!Schema::hasColumn('ordres_travail', 'validated_by')) {
                $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            }
        });

        // Add user_id to notes_debut for validated_by
        Schema::table('notes_debut', function (Blueprint $table) {
            if (!Schema::hasColumn('notes_debut', 'validated_by')) {
                $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ordres_travail', function (Blueprint $table) {
            $table->dropForeign(['validated_by']);
            $table->dropColumn('validated_by');
        });

        Schema::table('notes_debut', function (Blueprint $table) {
            $table->dropForeign(['validated_by']);
            $table->dropColumn('validated_by');
        });
    }
};

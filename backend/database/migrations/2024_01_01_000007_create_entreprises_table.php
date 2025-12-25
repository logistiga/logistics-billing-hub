<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entreprises', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('legal_form')->nullable();
            $table->string('siret')->nullable();
            $table->string('tva_number')->nullable();
            $table->string('capital')->nullable();
            $table->text('address')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('France');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            $table->string('iban')->nullable();
            $table->string('bic')->nullable();
            $table->string('bank_name')->nullable();
            $table->decimal('default_tva_rate', 5, 2)->default(20.00);
            $table->text('invoice_footer')->nullable();
            $table->text('devis_footer')->nullable();
            $table->string('invoice_prefix')->default('FAC');
            $table->string('devis_prefix')->default('DEV');
            $table->string('avoir_prefix')->default('AV');
            $table->string('ordre_prefix')->default('OT');
            $table->integer('next_invoice_number')->default(1);
            $table->integer('next_devis_number')->default(1);
            $table->integer('next_avoir_number')->default(1);
            $table->integer('next_ordre_number')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entreprises');
    }
};

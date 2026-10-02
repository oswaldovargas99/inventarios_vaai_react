<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('postal_codes', function (Blueprint $table) {
            $table->id();
            $table->string('d_codigo', 10);
            $table->string('d_asenta', 255);
            $table->string('d_tipo_asenta', 100)->nullable();
            $table->string('D_mnpio', 255)->nullable();
            $table->string('d_estado', 255);
            $table->string('d_ciudad', 255)->nullable();
            $table->string('d_CP', 10)->nullable();
            $table->string('c_estado', 10)->nullable();
            $table->string('c_oficina', 10)->nullable();
            $table->string('c_CP', 10)->nullable();
            $table->string('c_tipo_asenta', 10)->nullable();
            $table->string('c_mnpio', 10)->nullable();
            $table->string('id_asenta_cpcons', 20)->nullable();
            $table->string('d_zona', 50)->nullable();
            $table->string('c_cve_ciudad', 10)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('d_codigo', 'idx_postal_codes_codigo');
            $table->index('c_estado', 'idx_postal_codes_estado');
            $table->index('c_mnpio', 'idx_postal_codes_municipio');
            $table->index('d_asenta', 'idx_postal_codes_asenta');
            $table->index('d_estado', 'idx_postal_codes_estado_nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postal_codes');
    }
};
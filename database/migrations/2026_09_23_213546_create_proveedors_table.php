<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaai_proveedores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_proveedor', 150);
            $table->string('razon_social', 200)->nullable();
            $table->string('constancia_sat', 255)->nullable();
            $table->string('constancia_sat_nombre_original', 255)->nullable();
            $table->text('direccion')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('correo', 150)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaai_proveedores');
    }
};
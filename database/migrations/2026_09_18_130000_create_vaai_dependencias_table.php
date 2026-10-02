<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaai_dependencias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_rector', 150);
            $table->string('tipo_dependencia', 50);
            $table->string('nombre', 150);
            $table->string('siglas', 20)->unique();
            $table->string('direccion', 255);
            $table->string('telefonos', 100);
            $table->string('sitio_web')->nullable();
            $table->string('colonia', 100);
            $table->string('codigo_postal', 10);
            $table->string('municipio', 100);
            $table->string('estado', 100);
            $table->string('pais', 100);
            $table->boolean('vigente')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaai_dependencias');
    }
};
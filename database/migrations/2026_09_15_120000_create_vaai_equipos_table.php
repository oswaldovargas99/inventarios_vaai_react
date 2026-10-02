<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaai_equipos', function (Blueprint $table) {
            $table->id();
            $table->string('id_equipo', 50)->unique();
            $table->foreignId('tipo_equipo_id')
                ->constrained('vaai_tipos_equipo')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('modelo_id')
                ->constrained('vaai_cat_modelos')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->string('numero_serie', 100)->unique();
            $table->string('descripcion', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaai_equipos');
    }
};
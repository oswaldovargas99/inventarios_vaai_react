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
        Schema::create('vaai_cat_modelos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('marca_id');

            $table->string('nombre', 100);

            $table->string('descripcion', 255)
                ->nullable();

            $table->boolean('estatus')
                ->default(true);

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Relación con Marcas
            |--------------------------------------------------------------------------
            |
            | Un modelo pertenece a una marca.
            | No se permitirá eliminar una marca mientras tenga modelos asociados.
            |
            */

            $table->foreign('marca_id')
                ->references('id')
                ->on('vaai_cat_marcas')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            /*
            |--------------------------------------------------------------------------
            | Modelo único por Marca
            |--------------------------------------------------------------------------
            |
            | Una marca no puede registrar dos veces el mismo modelo.
            | El mismo nombre sí puede existir para marcas diferentes.
            |
            */

            $table->unique(
                ['marca_id', 'nombre'],
                'vaai_modelos_marca_nombre_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaai_cat_modelos');
    }
};
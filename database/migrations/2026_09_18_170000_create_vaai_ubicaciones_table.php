<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaai_paises', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150)->unique();
            $table->string('codigo_iso2', 2)->nullable()->unique();
            $table->string('codigo_iso3', 3)->nullable()->unique();
            $table->timestamps();
        });

        Schema::create('vaai_entidades_federativas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pais_id')->constrained('vaai_paises')->cascadeOnDelete();
            $table->string('nombre', 150);
            $table->string('codigo', 10)->nullable();
            $table->timestamps();
            $table->unique(['pais_id', 'nombre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaai_entidades_federativas');
        Schema::dropIfExists('vaai_paises');
    }
};
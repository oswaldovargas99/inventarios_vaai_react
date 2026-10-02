<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaai_traslados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')
                ->constrained('vaai_equipos')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->string('dependencia', 30);
            $table->string('destino', 150);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaai_traslados');
    }
};
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
        Schema::create('vaai_usuarios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rol_id')
                ->constrained('vaai_roles')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('codigo', 20)
                ->unique();

            $table->string('nombre', 100);

            $table->string('apellido_paterno', 100)->nullable();

            $table->string('apellido_materno', 100)->nullable();

            $table->string('correo', 150)
                ->nullable()
                ->unique();

            $table->string('password');

            $table->boolean('activo')
                ->default(true);

            $table->rememberToken();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaai_usuarios');
    }
};
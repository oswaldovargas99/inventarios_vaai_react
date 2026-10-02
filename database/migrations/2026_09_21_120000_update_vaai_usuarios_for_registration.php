<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vaai_usuarios', function (Blueprint $table) {
            $table->string('email', 150)->nullable()->unique()->after('correo');
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->boolean('two_factor')->default(false)->after('two_factor_secret');
            $table->text('recovery_codes')->nullable()->after('two_factor');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('recovery_codes');
            $table->unsignedBigInteger('id_centro_universitario')->nullable()->after('two_factor_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('vaai_usuarios', function (Blueprint $table) {
            $table->dropColumn([
                'two_factor_secret',
                'two_factor',
                'recovery_codes',
                'two_factor_confirmed_at',
                'id_centro_universitario',
                'email',
            ]);
        });
    }
};

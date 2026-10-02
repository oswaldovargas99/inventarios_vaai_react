<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vaai_dependencias', function (Blueprint $table) {
            $table->string('pais', 100)->default('México')->after('telefonos');
        });
    }

    public function down(): void
    {
        Schema::table('vaai_dependencias', function (Blueprint $table) {
            $table->dropColumn('pais');
        });
    }
};
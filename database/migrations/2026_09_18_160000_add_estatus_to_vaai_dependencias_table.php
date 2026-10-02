<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vaai_dependencias', function (Blueprint $table) {
            $table->string('estatus', 20)->default('activo')->after('vigente');
        });
    }

    public function down(): void
    {
        Schema::table('vaai_dependencias', function (Blueprint $table) {
            $table->dropColumn('estatus');
        });
    }
};

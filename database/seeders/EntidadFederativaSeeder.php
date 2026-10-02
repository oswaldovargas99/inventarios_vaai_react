<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EntidadFederativaSeeder extends Seeder
{
    public function run(): void
    {
        $paisId = DB::table('vaai_paises')->where('nombre', 'México')->value('id');
        if (!$paisId) {
            return;
        }

        $entidades = DB::table('postal_codes')
            ->whereNotNull('d_estado')
            ->select('d_estado')
            ->distinct()
            ->orderBy('d_estado')
            ->pluck('d_estado');

        $ahora = now();
        DB::table('vaai_entidades_federativas')->upsert(
            $entidades->map(fn ($nombre) => [
                'pais_id' => $paisId, 'nombre' => $nombre,
                'created_at' => $ahora, 'updated_at' => $ahora,
            ])->all(),
            ['pais_id', 'nombre'], ['updated_at']
        );
    }
}
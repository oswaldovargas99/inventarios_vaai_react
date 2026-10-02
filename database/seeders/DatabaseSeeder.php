<?php

namespace Database\Seeders;

use Database\Seeders\Administrador\Catalogos\MarcaSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolSeeder::class,
            UsuarioSeeder::class,
            TipoEquipoSeeder::class,
            MarcaSeeder::class,
            CpSeeder::class,
            PaisSeeder::class,
            EntidadFederativaSeeder::class,
            CentroUniversitarioSeeder::class,
            DependenciaSeeder::class,
        ]);
    }
}

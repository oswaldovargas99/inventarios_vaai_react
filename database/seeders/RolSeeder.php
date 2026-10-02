<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso total al sistema.',
                'activo' => true,
            ],
            [
                'nombre' => 'Patrimonio',
                'descripcion' => 'Gestión y control patrimonial de los bienes.',
                'activo' => true,
            ],
            [
                'nombre' => 'Secretario',
                'descripcion' => 'Gestión y consulta de información administrativa.',
                'activo' => true,
            ],
            [
                'nombre' => 'Usuario',
                'descripcion' => 'Consulta y operaciones permitidas para usuarios generales.',
                'activo' => true,
            ],
        ];

        foreach ($roles as $rol) {
            Rol::updateOrCreate(
                ['nombre' => $rol['nombre']],
                $rol
            );
        }
    }
}
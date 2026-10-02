<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rolAdministrador = Rol::where('nombre', 'Administrador')->firstOrFail();

        Usuario::updateOrCreate(
            [
                'codigo' => '1000001',
            ],
            [
                'rol_id' => $rolAdministrador->id,
                'nombre' => 'Administrador',
                'apellido_paterno' => 'Sistema',
                'apellido_materno' => null,
                'correo' => null,
                'password' => Hash::make('Admin123*'),
                'activo' => true,
            ]
        );
    }
}
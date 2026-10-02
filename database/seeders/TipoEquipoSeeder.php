<?php

namespace Database\Seeders;

use App\Models\Administrador\Catalogos\TipoEquipo;
use Illuminate\Database\Seeder;

class TipoEquipoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiposEquipo = [
            [
                'nombre' => 'Computadora de Escritorio',
                'descripcion' => 'Equipo de cómputo de escritorio.',
                'estatus' => true,
            ],
            [
                'nombre' => 'Laptop',
                'descripcion' => 'Equipo de cómputo portátil.',
                'estatus' => true,
            ],
            [
                'nombre' => 'Monitor',
                'descripcion' => 'Monitor para equipo de cómputo.',
                'estatus' => true,
            ],
            [
                'nombre' => 'Impresora',
                'descripcion' => 'Equipo utilizado para impresión.',
                'estatus' => true,
            ],
            [
                'nombre' => 'Escáner',
                'descripcion' => 'Equipo utilizado para digitalización.',
                'estatus' => true,
            ],
            [
                'nombre' => 'No Break',
                'descripcion' => 'Sistema de alimentación ininterrumpida.',
                'estatus' => true,
            ],
            [
                'nombre' => 'Proyector',
                'descripcion' => 'Equipo utilizado para proyección de imagen.',
                'estatus' => true,
            ],
            [
                'nombre' => 'Switch',
                'descripcion' => 'Equipo de comunicaciones para red.',
                'estatus' => true,
            ],
            [
                'nombre' => 'Access Point',
                'descripcion' => 'Equipo de acceso a red inalámbrica.',
                'estatus' => true,
            ],
        ];

        foreach ($tiposEquipo as $tipoEquipo) {
            TipoEquipo::updateOrCreate(
                [
                    'nombre' => $tipoEquipo['nombre'],
                ],
                $tipoEquipo
            );
        }
    }
}

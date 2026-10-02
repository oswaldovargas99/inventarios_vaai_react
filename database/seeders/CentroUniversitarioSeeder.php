<?php

namespace Database\Seeders;

use App\Models\CentroUniversitario;
use Illuminate\Database\Seeder;

class CentroUniversitarioSeeder extends Seeder
{
    public function run(): void
    {
        $centros = [
            ['nombre' => 'Centro Universitario de Arte, Arquitectura y Diseño', 'abreviatura' => 'CUAAD'],
            ['nombre' => 'Centro Universitario de Ciencias Biológicas y Agropecuarias', 'abreviatura' => 'CUCBA'],
            ['nombre' => 'Centro Universitario de Ciencias Económico Administrativas', 'abreviatura' => 'CUCEA'],
            ['nombre' => 'Centro Universitario de Ciencias Exactas e Ingenierías', 'abreviatura' => 'CUCEI'],
            ['nombre' => 'Centro Universitario de Ciencias de la Salud', 'abreviatura' => 'CUCS'],
            ['nombre' => 'Centro Universitario de Ciencias Sociales y Humanidades', 'abreviatura' => 'CUCSH'],
            ['nombre' => 'Centro Universitario de los Altos', 'abreviatura' => 'CUALTOS'],
            ['nombre' => 'Centro Universitario de la Ciénega', 'abreviatura' => 'CUCIENEGA'],
            ['nombre' => 'Centro Universitario de la Costa', 'abreviatura' => 'CUCOSTA'],
            ['nombre' => 'Centro Universitario de la Costa Sur', 'abreviatura' => 'CUCOSTASUR'],
            ['nombre' => 'Centro Universitario de los Lagos', 'abreviatura' => 'CULAGOS'],
            ['nombre' => 'Centro Universitario del Norte', 'abreviatura' => 'CUNORTE'],
            ['nombre' => 'Centro Universitario del Sur', 'abreviatura' => 'CUSUR'],
            ['nombre' => 'Centro Universitario de Tonalá', 'abreviatura' => 'CUTONALA'],
            ['nombre' => 'Centro Universitario de Tlajomulco', 'abreviatura' => 'CUTLAJOMULCO'],
            ['nombre' => 'Centro Universitario de los Valles', 'abreviatura' => 'CUVALLES'],
            ['nombre' => 'Sistema de Universidad Virtual', 'abreviatura' => 'SUV'],
        ];

        foreach ($centros as $centro) {
            CentroUniversitario::updateOrCreate(
                ['abreviatura' => $centro['abreviatura']],
                ['nombre' => $centro['nombre'], 'activo' => true],
            );
        }
    }
}

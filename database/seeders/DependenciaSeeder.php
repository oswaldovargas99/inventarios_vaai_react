<?php

namespace Database\Seeders;

use App\Models\Administrador\Dependencia;
use App\Models\CentroUniversitario;
use Illuminate\Database\Seeder;

class DependenciaSeeder extends Seeder
{
    public function run(): void
    {
        $metadatos = [
            'CUAAD' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Guadalajara', 'sitio_web' => 'https://cuaad.udg.mx'],
            'CUCBA' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Zapopan', 'sitio_web' => 'https://cucba.udg.mx'],
            'CUCEA' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Zapopan', 'sitio_web' => 'https://www.cucea.udg.mx'],
            'CUCEI' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Guadalajara', 'sitio_web' => 'https://www.cucei.udg.mx'],
            'CUCS' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Guadalajara', 'sitio_web' => 'https://www.cucs.udg.mx'],
            'CUCSH' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Guadalajara', 'sitio_web' => 'https://www.cucsh.udg.mx'],
            'CUALTOS' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Tepatitlán de Morelos', 'sitio_web' => 'https://www.cualtos.udg.mx'],
            'CUCIENEGA' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Ocotlán', 'sitio_web' => 'https://www.cuci.udg.mx'],
            'CUCOSTA' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Puerto Vallarta', 'sitio_web' => 'https://www.cuc.udg.mx'],
            'CUCOSTASUR' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Autlán de Navarro', 'sitio_web' => 'https://www.cucsur.udg.mx'],
            'CULAGOS' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Lagos de Moreno', 'sitio_web' => 'https://www.culagos.udg.mx'],
            'CUNORTE' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Colotlán', 'sitio_web' => 'https://www.cunorte.udg.mx'],
            'CUSUR' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Ciudad Guzmán', 'sitio_web' => 'https://www.cusur.udg.mx'],
            'CUTONALA' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Tonalá', 'sitio_web' => 'https://www.cutonala.udg.mx'],
            'CUTLAJOMULCO' => ['tipo_dependencia' => 'Temática', 'municipio' => 'Tlajomulco de Zúñiga', 'sitio_web' => 'https://www.udg.mx'],
            'CUVALLES' => ['tipo_dependencia' => 'Regional', 'municipio' => 'Ameca', 'sitio_web' => 'https://www.cuvalles.udg.mx'],
            'SUV' => ['tipo_dependencia' => 'Sistema', 'municipio' => 'Guadalajara', 'sitio_web' => 'https://www.udgvirtual.udg.mx'],
        ];

        foreach (CentroUniversitario::query()->orderBy('nombre')->get() as $centro) {
            $extra = $metadatos[$centro->abreviatura] ?? [
                'tipo_dependencia' => 'Temática',
                'municipio' => 'Guadalajara',
                'sitio_web' => null,
            ];

            Dependencia::updateOrCreate(
                ['siglas' => $centro->abreviatura],
                [
                    'nombre' => $centro->nombre,
                    'tipo_dependencia' => $extra['tipo_dependencia'],
                    'municipio' => $extra['municipio'],
                    'sitio_web' => $extra['sitio_web'],
                    'nombre_rector' => 'Pendiente',
                    'direccion' => 'Pendiente',
                    'telefonos' => '3333333333',
                    'colonia' => 'Pendiente',
                    'codigo_postal' => '00000',
                    'estado' => 'Jalisco',
                    'pais' => 'México',
                    'vigente' => true,
                ]
            );
        }
    }
}

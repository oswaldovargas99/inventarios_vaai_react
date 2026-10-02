<?php

namespace Database\Seeders\Administrador\Catalogos;

use App\Models\Administrador\Catalogos\Marca;
use Illuminate\Database\Seeder;

class MarcaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $marcas = [
            'Acer',
            'Apple',
            'Asus',
            'Brother',
            'Canon',
            'Dell',
            'Epson',
            'HP',
            'Kyocera',
            'Lenovo',
            'LG',
            'Samsung',
        ];

        foreach ($marcas as $marca) {
            Marca::updateOrCreate(
                [
                    'nombre' => $marca,
                ],
                [
                    'estatus' => true,
                ]
            );
        }
    }
}
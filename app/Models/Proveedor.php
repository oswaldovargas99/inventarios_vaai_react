<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    use HasFactory;

    protected $table = 'vaai_proveedores';

    protected $fillable = [
        'nombre_proveedor',
        'razon_social',
        'constancia_sat',
        'constancia_sat_nombre_original',
        'direccion',
        'telefono',
        'correo',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
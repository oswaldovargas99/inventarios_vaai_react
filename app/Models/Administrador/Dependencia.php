<?php

namespace App\Models\Administrador;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dependencia extends Model
{
    use HasFactory;

    protected $table = 'vaai_dependencias';

    protected $fillable = [
        'nombre_rector',
        'tipo_dependencia',
        'nombre',
        'siglas',
        'direccion',
        'telefonos',
        'sitio_web',
        'pais',
        'colonia',
        'codigo_postal',
        'municipio',
        'estado',
        'vigente',
        'estatus',
    ];

    protected $casts = [
        'vigente' => 'boolean',
        'estatus' => 'string',
    ];
}
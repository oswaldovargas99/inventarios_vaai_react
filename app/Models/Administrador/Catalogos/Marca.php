<?php

namespace App\Models\Administrador\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Marca extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla.
     */
    protected $table = 'vaai_cat_marcas';

    /**
     * Campos permitidos para asignación masiva.
     */
    protected $fillable = [
        'nombre',
        'estatus',
    ];

    /**
     * Conversión automática de tipos.
     */
    protected $casts = [
        'estatus' => 'boolean',
    ];
}
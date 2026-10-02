<?php

namespace App\Models\Administrador\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoEquipo extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla.
     */
    protected $table = 'vaai_tipos_equipo';

    /**
     * Campos permitidos para asignación masiva.
     */
    protected $fillable = [
        'nombre',
        'descripcion',
        'estatus',
    ];

    /**
     * Conversión automática de tipos.
     */
    protected $casts = [
        'estatus' => 'boolean',
    ];
}
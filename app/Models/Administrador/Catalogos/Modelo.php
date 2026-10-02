<?php

namespace App\Models\Administrador\Catalogos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Modelo extends Model
{
    use HasFactory;

    /**
     * Tabla asociada al modelo.
     */
    protected $table = 'vaai_cat_modelos';

    /**
     * Campos permitidos para asignación masiva.
     */
    protected $fillable = [
        'marca_id',
        'nombre',
        'descripcion',
        'estatus',
    ];

    /**
     * Conversión de tipos.
     */
    protected $casts = [
        'estatus' => 'boolean',
    ];

    /**
     * Un modelo pertenece a una marca.
     */
    public function marca(): BelongsTo
    {
        return $this->belongsTo(
            Marca::class,
            'marca_id'
        );
    }
}
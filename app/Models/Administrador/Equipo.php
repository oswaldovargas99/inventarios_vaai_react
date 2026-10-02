<?php

namespace App\Models\Administrador;

use App\Models\Administrador\Catalogos\Modelo;
use App\Models\Administrador\Catalogos\TipoEquipo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    use HasFactory;

    protected $table = 'vaai_equipos';

    protected $fillable = [
        'id_equipo',
        'tipo_equipo_id',
        'modelo_id',
        'numero_serie',
        'descripcion',
        'estatus',
        'observaciones',
    ];

    public function tipoEquipo()
    {
        return $this->belongsTo(TipoEquipo::class);
    }

    public function modelo()
    {
        return $this->belongsTo(Modelo::class);
    }

    public function traslados()
    {
        return $this->hasMany(Traslado::class);
    }
}
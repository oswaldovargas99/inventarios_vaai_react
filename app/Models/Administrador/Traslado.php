<?php

namespace App\Models\Administrador;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Traslado extends Model
{
    use HasFactory;

    protected $table = 'vaai_traslados';

    protected $fillable = [
        'equipo_id',
        'dependencia',
        'destino',
    ];

    public function equipo()
    {
        return $this->belongsTo(Equipo::class);
    }
}
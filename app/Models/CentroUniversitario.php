<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CentroUniversitario extends Model
{
    use HasFactory;

    protected $table = 'vaai_centros_universitarios';

    protected $fillable = [
        'nombre',
        'abreviatura',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
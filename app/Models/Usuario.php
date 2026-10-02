<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'vaai_usuarios';

    protected $fillable = [
        'rol_id',
        'codigo',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'email',
        'correo',
        'password',
        'two_factor_secret',
        'two_factor',
        'recovery_codes',
        'two_factor_confirmed_at',
        'id_centro_universitario',
        'activo',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'recovery_codes',
        'remember_token',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'two_factor' => 'boolean',
        'two_factor_confirmed_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}
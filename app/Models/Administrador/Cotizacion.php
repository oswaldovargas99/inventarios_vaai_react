<?php

namespace App\Models\Administrador;

use App\Models\Proveedor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cotizacion extends Model
{
    use HasFactory;

    protected $table = 'vaai_cotizaciones';

    protected $fillable = [
        'nombre_solicitante',
        'descripcion',
        'monto',
        'proveedor_id',
        'fecha_solicitud',
        'fecha_entrega',
        'estatus',
        'archivo_cotizacion',
        'archivo_factura',
        'cotizacion_nombre_original',
        'factura_nombre_original',
        'facturas_nombre_original',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_solicitud' => 'date',
        'fecha_entrega' => 'date',
        'estatus' => 'boolean',
    ];

    /**
     * Relación con el proveedor
     */
    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }
}
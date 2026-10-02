<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vaai_cotizaciones', function (Blueprint $table) {
            $table->id(); // ID autogenerado BigIncrement
            $table->string('nombre_solicitante', 150);
            $table->text('descripcion');
            $table->decimal('monto', 12, 2); // Monto con 2 decimales para dinero
            
            // Relación con la tabla de proveedores existente (vaai_proveedores)
            $table->foreignId('proveedor_id')
                ->constrained('vaai_proveedores')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->date('fecha_solicitud'); // Fecha en que se solicitó
            $table->date('fecha_entrega')->nullable(); // Fecha estimada de entrega

            // Archivos adjuntos y sus nombres originales
            $table->string('archivo_cotizacion')->nullable();
            $table->string('cotizacion_nombre_original')->nullable();
            $table->string('archivo_factura')->nullable();
            $table->string('factura_nombre_original')->nullable();

            $table->boolean('estatus')->default(true); // Estatus activo/inactivo
            $table->timestamps(); // created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaai_cotizaciones');
    }
};
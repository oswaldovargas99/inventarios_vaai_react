<?php

namespace App\Http\Controllers\Administrador;

use App\Http\Controllers\Controller;
use App\Models\Administrador\Cotizacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CotizacionController extends Controller
{
    /**
     * Listar cotizaciones con filtros y paginación.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'buscar' => ['nullable', 'string', 'max:255'],
        ]);

        $buscar = trim((string) $request->query('buscar', ''));

        $cotizaciones = Cotizacion::query()
            ->with(['proveedor:id,nombre_proveedor,razon_social'])
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($consulta) use ($buscar) {
                    $consulta
                        ->where('nombre_solicitante', 'like', '%'.$buscar.'%')
                        ->orWhere('descripcion', 'like', '%'.$buscar.'%')
                        ->orWhereHas('proveedor', function ($qProv) use ($buscar) {
                            $qProv->where('nombre_proveedor', 'like', '%'.$buscar.'%')
                                ->orWhere('razon_social', 'like', '%'.$buscar.'%');
                        });
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $cotizaciones,
        ]);
    }

    /**
     * Mostrar el detalle de una cotización específica.
     */
    public function show(Cotizacion $cotizacion): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $cotizacion->load('proveedor'),
        ]);
    }

    /**
     * Registrar una nueva cotización en el sistema.
     */
    public function store(Request $request): JsonResponse
    {
        $validado = $this->validarDatos($request);
        $validado['estatus'] = $validado['estatus'] ?? true;

        // Capturar y subir archivo de cotización con su nombre original
        $archivoCot = $request->file('archivo_cotizacion') ?? $request->file('cotizacion');
        if ($archivoCot) {
            $validado['archivo_cotizacion'] = $archivoCot->store('cotizaciones/documentos', 'public');
            $validado['cotizacion_nombre_original'] = $archivoCot->getClientOriginalName();
        }

        // Capturar y subir factura con su nombre original
        $archivoFac = $request->file('archivo_factura') ?? $request->file('facturas');
        if ($archivoFac) {
            $validado['archivo_factura'] = $archivoFac->store('cotizaciones/facturas', 'public');
            $validado['factura_nombre_original'] = $archivoFac->getClientOriginalName();
        }

        $cotizacion = Cotizacion::create($validado);

        return response()->json([
            'success' => true,
            'message' => 'Cotización registrada correctamente.',
            'data' => $cotizacion->load('proveedor'),
        ], 201);
    }

    /**
     * Actualizar una cotización existente.
     */
    public function update(Request $request, Cotizacion $cotizacion): JsonResponse
    {
        $validado = $this->validarDatos($request, $cotizacion);

        // Actualizar archivo de cotización si viene uno nuevo
        $archivoCot = $request->file('archivo_cotizacion') ?? $request->file('cotizacion');
        if ($archivoCot) {
            if ($cotizacion->archivo_cotizacion && Storage::disk('public')->exists($cotizacion->archivo_cotizacion)) {
                Storage::disk('public')->delete($cotizacion->archivo_cotizacion);
            }
            $validado['archivo_cotizacion'] = $archivoCot->store('cotizaciones/documentos', 'public');
            $validado['cotizacion_nombre_original'] = $archivoCot->getClientOriginalName();
        }

        // Actualizar archivo de factura si viene uno nuevo
        $archivoFac = $request->file('archivo_factura') ?? $request->file('facturas');
        if ($archivoFac) {
            if ($cotizacion->archivo_factura && Storage::disk('public')->exists($cotizacion->archivo_factura)) {
                Storage::disk('public')->delete($cotizacion->archivo_factura);
            }
            $validado['archivo_factura'] = $archivoFac->store('cotizaciones/facturas', 'public');
            $validado['factura_nombre_original'] = $archivoFac->getClientOriginalName();
        }

        $cotizacion->update($validado);

        return response()->json([
            'success' => true,
            'message' => 'Cotización actualizada correctamente.',
            'data' => $cotizacion->fresh('proveedor'),
        ]);
    }

    /**
     * Descargar o visualizar el archivo adjunto conservando el nombre original.
     */
    public function descargarArchivo(Cotizacion $cotizacion, Request $request): StreamedResponse|JsonResponse
    {
        $tipo = $request->query('tipo', 'cotizacion');
        $esFactura = in_array($tipo, ['factura', 'facturas']);

        $ruta = $esFactura ? $cotizacion->archivo_factura : $cotizacion->archivo_cotizacion;

        if (!$ruta || !Storage::disk('public')->exists($ruta)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo solicitado no existe o no ha sido cargado.'
            ], 404);
        }

        $nombreOriginal = $esFactura
            ? ($cotizacion->factura_nombre_original ?? basename($ruta))
            : ($cotizacion->cotizacion_nombre_original ?? basename($ruta));

        return Storage::disk('public')->download($ruta, $nombreOriginal);
    }

    /**
     * Cambiar el estatus (activo/inactivo) de una cotización.
     */
    public function cambiarEstatus(Request $request, Cotizacion $cotizacion): JsonResponse
    {
        $nuevoEstatus = $request->has('estatus')
            ? $request->boolean('estatus')
            : !$cotizacion->estatus;

        $cotizacion->update(['estatus' => $nuevoEstatus]);

        return response()->json([
            'success' => true,
            'message' => 'Estatus de la cotización actualizado correctamente.',
            'data' => $cotizacion->fresh('proveedor'),
        ]);
    }

    /**
     * Eliminar una cotización.
     */
    public function destroy(Cotizacion $cotizacion): JsonResponse
    {
        // Limpiar archivos físicos guardados en storage
        if ($cotizacion->archivo_cotizacion && Storage::disk('public')->exists($cotizacion->archivo_cotizacion)) {
            Storage::disk('public')->delete($cotizacion->archivo_cotizacion);
        }
        if ($cotizacion->archivo_factura && Storage::disk('public')->exists($cotizacion->archivo_factura)) {
            Storage::disk('public')->delete($cotizacion->archivo_factura);
        }

        $cotizacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cotización eliminada correctamente.',
        ]);
    }

    /**
     * Validar y limpiar los datos de la solicitud.
     */
    private function validarDatos(Request $request, ?Cotizacion $cotizacion = null): array
    {
        $datos = $request->all();
        foreach (['nombre_solicitante', 'descripcion', 'fecha_solicitud', 'fecha_entrega'] as $campo) {
            if (isset($datos[$campo]) && is_string($datos[$campo])) {
                $datos[$campo] = trim($datos[$campo]);
            }
        }
        $request->merge($datos);

        $reglas = [
            'nombre_solicitante' => ['required', 'string', 'max:150'],
            'descripcion'        => ['required', 'string'],
            'monto'              => ['required', 'numeric', 'gt:0'],
            'proveedor_id'       => ['required', 'integer', Rule::exists('vaai_proveedores', 'id')],
            'fecha_solicitud'    => ['required', 'date'],
            'fecha_entrega'      => ['nullable', 'date', 'after_or_equal:fecha_solicitud'],
            'estatus'            => ['sometimes', 'boolean'],
            'archivo_cotizacion' => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,zip', 'max:10240'],
            'cotizacion'         => ['nullable', 'file', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,zip', 'max:10240'],
            'archivo_factura'    => ['nullable', 'file', 'mimes:pdf,xml,jpg,jpeg,png', 'max:10240'],
            'facturas'           => ['nullable', 'file', 'mimes:pdf,xml,jpg,jpeg,png', 'max:10240'],
        ];

        return $request->validate($reglas, [
            'nombre_solicitante.required' => 'El nombre del solicitante es obligatorio.',
            'nombre_solicitante.max'      => 'El nombre del solicitante no debe exceder los 150 caracteres.',
            'descripcion.required'        => 'La descripción es obligatoria.',
            'monto.required'              => 'El monto es obligatorio.',
            'monto.numeric'               => 'El monto debe ser un número válido.',
            'monto.gt'                    => 'El monto debe ser mayor a 0.',
            'proveedor_id.required'      => 'Selecciona un proveedor.',
            'proveedor_id.exists'        => 'El proveedor seleccionado no es válido.',
            'fecha_solicitud.required'   => 'La fecha de solicitud es obligatoria.',
            'fecha_solicitud.date'       => 'Ingresa una fecha de solicitud válida.',
            'fecha_entrega.date'         => 'Ingresa una fecha de entrega válida.',
            'fecha_entrega.after_or_equal' => 'La fecha de entrega debe ser posterior o igual a la fecha de solicitud.',
            'archivo_cotizacion.file'    => 'El archivo de cotización debe ser un documento válido.',
            'archivo_cotizacion.mimes'   => 'El archivo de cotización debe ser PDF, DOC, DOCX, XLS, XLSX, JPG, PNG o ZIP.',
            'archivo_cotizacion.max'     => 'El archivo de cotización no debe superar los 10 MB.',
            'archivo_factura.file'       => 'El archivo de factura debe ser un documento válido.',
            'archivo_factura.mimes'      => 'La factura debe ser formato PDF, XML, JPG o PNG.',
            'archivo_factura.max'        => 'La factura no debe superar los 10 MB.',
        ]);
    }
}
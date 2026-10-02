<?php

namespace App\Http\Controllers\Administrador;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProveedorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $proveedores = Proveedor::when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($consulta) use ($buscar) {
                    $consulta
                        ->where('nombre_proveedor', 'like', '%'.$buscar.'%')
                        ->orWhere('razon_social', 'like', '%'.$buscar.'%')
                        ->orWhere('correo', 'like', '%'.$buscar.'%')
                        ->orWhere('telefono', 'like', '%'.$buscar.'%');
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        // Adjuntar dinámicamente la URL completa de la constancia SAT a cada registro
        $proveedores->getCollection()->transform(function ($proveedor) {
            $proveedor->constancia_sat_url = $proveedor->constancia_sat
                ? Storage::disk('public')->url($proveedor->constancia_sat)
                : null;
            return $proveedor;
        });

        return response()->json([
            'success' => true,
            'data' => $proveedores,
        ]);
    }

    public function show(Proveedor $proveedor): JsonResponse
    {
        $proveedor->constancia_sat_url = $proveedor->constancia_sat
            ? Storage::disk('public')->url($proveedor->constancia_sat)
            : null;

        return response()->json([
            'success' => true,
            'data' => $proveedor,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $request->validate([
            'nombre_proveedor' => ['required', 'string', 'max:150'],
            'razon_social' => ['nullable', 'string', 'max:200'],
            'constancia_sat' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // Máx 5MB
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'correo' => ['nullable', 'email', 'max:150'],
        ], $this->mensajesValidacion());

        $rutaConstancia = null;
        $nombreOriginal = null;

        if ($request->hasFile('constancia_sat')) {
            $archivo = $request->file('constancia_sat');
            $rutaConstancia = $archivo->store('constancias_sat', 'public');
            $nombreOriginal = $archivo->getClientOriginalName();
        }

        $proveedor = Proveedor::create([
            'nombre_proveedor' => trim($validado['nombre_proveedor']),
            'razon_social' => trim((string) ($validado['razon_social'] ?? '')) ?: null,
            'constancia_sat' => $rutaConstancia,
            'constancia_sat_nombre_original' => $nombreOriginal,
            'direccion' => trim((string) ($validado['direccion'] ?? '')) ?: null,
            'telefono' => trim((string) ($validado['telefono'] ?? '')) ?: null,
            'correo' => trim((string) ($validado['correo'] ?? '')) ?: null,
            'activo' => true,
        ]);

        $proveedor->constancia_sat_url = $proveedor->constancia_sat
            ? Storage::disk('public')->url($proveedor->constancia_sat)
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Proveedor registrado correctamente.',
            'data' => $proveedor,
        ], 201);
    }

    public function update(Request $request, Proveedor $proveedor): JsonResponse
    {
        $validado = $request->validate([
            'nombre_proveedor' => ['required', 'string', 'max:150'],
            'razon_social' => ['nullable', 'string', 'max:200'],
            'constancia_sat' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'correo' => ['nullable', 'email', 'max:150'],
            'activo' => ['nullable'],
        ], $this->mensajesValidacion());

        $datos = [
            'nombre_proveedor' => trim($validado['nombre_proveedor']),
            'razon_social' => trim((string) ($validado['razon_social'] ?? '')) ?: null,
            'direccion' => trim((string) ($validado['direccion'] ?? '')) ?: null,
            'telefono' => trim((string) ($validado['telefono'] ?? '')) ?: null,
            'correo' => trim((string) ($validado['correo'] ?? '')) ?: null,
        ];

        if ($request->has('activo')) {
            $datos['activo'] = $request->boolean('activo');
        }

        if ($request->hasFile('constancia_sat')) {
            // Eliminar constancia anterior si existe
            if ($proveedor->constancia_sat && Storage::disk('public')->exists($proveedor->constancia_sat)) {
                Storage::disk('public')->delete($proveedor->constancia_sat);
            }

            $archivo = $request->file('constancia_sat');
            $datos['constancia_sat'] = $archivo->store('constancias_sat', 'public');
            $datos['constancia_sat_nombre_original'] = $archivo->getClientOriginalName();
        }

        $proveedor->update($datos);

        $proveedorActualizado = $proveedor->fresh();
        $proveedorActualizado->constancia_sat_url = $proveedorActualizado->constancia_sat
            ? Storage::disk('public')->url($proveedorActualizado->constancia_sat)
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Proveedor actualizado correctamente.',
            'data' => $proveedorActualizado,
        ]);
    }

    public function cambiarEstatus(Request $request, Proveedor $proveedor): JsonResponse
    {
        $validado = $request->validate([
            'activo' => ['required', 'boolean'],
        ], $this->mensajesValidacion());

        $proveedor->update([
            'activo' => $validado['activo'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estatus del proveedor actualizado correctamente.',
            'data' => $proveedor->fresh(),
        ]);
    }

    public function destroy(Proveedor $proveedor): JsonResponse
    {
        if ($proveedor->constancia_sat && Storage::disk('public')->exists($proveedor->constancia_sat)) {
            Storage::disk('public')->delete($proveedor->constancia_sat);
        }

        $proveedor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Proveedor eliminado correctamente.',
        ]);
    }

    /**
     * Retorna la constancia SAT en formato binario para consumo por API/Axios.
     */
    public function verConstancia(Proveedor $proveedor): BinaryFileResponse|JsonResponse
    {
        if (!$proveedor->constancia_sat || !Storage::disk('public')->exists($proveedor->constancia_sat)) {
            return response()->json(['message' => 'Archivo no encontrado.'], 404);
        }

        $path = Storage::disk('public')->path($proveedor->constancia_sat);

        return response()->file($path, [
            'Content-Disposition' => 'inline; filename="' . ($proveedor->constancia_sat_nombre_original ?? basename($path)) . '"',
        ]);
    }

    private function mensajesValidacion(): array
    {
        return [
            'nombre_proveedor.required' => 'El nombre del proveedor es obligatorio.',
            'nombre_proveedor.max' => 'El nombre del proveedor no debe exceder los 150 caracteres.',
            'correo.email' => 'El correo electrónico no es válido.',
            'constancia_sat.file' => 'La constancia del SAT debe ser un archivo válido.',
            'constancia_sat.mimes' => 'La constancia del SAT debe ser formato PDF, JPG, JPEG o PNG.',
            'constancia_sat.max' => 'El archivo de la constancia no debe pesar más de 5MB.',
            'activo.required' => 'El estatus es obligatorio.',
            'activo.boolean' => 'Selecciona un estatus válido.',
        ];
    }
}
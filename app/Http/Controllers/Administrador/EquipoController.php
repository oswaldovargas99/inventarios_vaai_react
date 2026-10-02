<?php

namespace App\Http\Controllers\Administrador;

use App\Http\Controllers\Controller;
use App\Models\Administrador\Equipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EquipoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'buscar' => ['nullable', 'string', 'max:255'],
            'tipo_equipo_id' => ['nullable', 'integer', 'min:1'],
            'estatus' => ['nullable', Rule::in(['activo', 'no_activo', 'para_baja'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Equipo::with([
            'tipoEquipo:id,nombre',
            'modelo:id,nombre',
        ]);

        if ($request->filled('buscar')) {
            $buscar = trim($request->buscar);
            $query->where(function ($consulta) use ($buscar) {
                $consulta
                    ->where('id_equipo', 'like', "%{$buscar}%")
                    ->orWhere('numero_serie', 'like', "%{$buscar}%")
                    ->orWhereHas('tipoEquipo', fn ($tipo) => $tipo->where('nombre', 'like', "%{$buscar}%"));
            });
        }

        if ($request->filled('tipo_equipo_id')) {
            $query->where('tipo_equipo_id', $request->tipo_equipo_id);
        }

        if ($request->filled('estatus')) {
            $query->where('estatus', $request->estatus);
        }

        $equipos = $query->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return response()->json($equipos);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_equipo' => ['required', 'string', 'max:50', 'unique:vaai_equipos,id_equipo'],
            'tipo_equipo_id' => ['required', 'integer', Rule::exists('vaai_tipos_equipo', 'id')->where('estatus', true)],
            'modelo_id' => ['required', 'integer', Rule::exists('vaai_cat_modelos', 'id')->where('estatus', true)],
            'numero_serie' => ['required', 'string', 'max:100', 'unique:vaai_equipos,numero_serie'],
            'descripcion' => ['required', 'string', 'max:255'],
            'estatus' => ['sometimes', Rule::in(['activo', 'no_activo', 'para_baja'])],
            'observaciones' => ['nullable', 'string', 'max:2000'],
        ], [
            'id_equipo.required' => 'El ID del equipo es obligatorio.',
            'tipo_equipo_id.required' => 'Selecciona un tipo de equipo.',
            'modelo_id.required' => 'Selecciona un modelo.',
            'numero_serie.required' => 'El número de serie es obligatorio.',
            'descripcion.required' => 'Escribe una descripción del equipo.',
        ]);

        $validated['estatus'] = $validated['estatus'] ?? 'activo';

        $equipo = Equipo::create($validated);
        $equipo->load(['tipoEquipo:id,nombre', 'modelo:id,nombre']);

        return response()->json([
            'success' => true,
            'message' => 'Equipo registrado correctamente.',
            'data' => $equipo,
        ], 201);
    }

    public function show(Equipo $equipo): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $equipo->load(['tipoEquipo', 'modelo']),
        ]);
    }

    public function update(Request $request, Equipo $equipo): JsonResponse
    {
        $validated = $request->validate([
            'estatus' => ['required', Rule::in(['activo', 'no_activo', 'para_baja'])],
            'observaciones' => ['nullable', 'string', 'max:2000'],
        ], [
            'estatus.required' => 'Selecciona un estatus para el equipo.',
        ]);

        $equipo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Equipo actualizado correctamente.',
            'data' => $equipo->fresh()->load(['tipoEquipo:id,nombre', 'modelo:id,nombre']),
        ]);
    }

    public function destroy(Equipo $equipo): JsonResponse
    {
        if ($equipo->estatus !== 'para_baja') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden eliminar equipos marcados para baja.',
            ], 422);
        }

        $equipo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipo dado de baja correctamente.',
        ]);
    }
}
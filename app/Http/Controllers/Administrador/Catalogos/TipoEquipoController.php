<?php

namespace App\Http\Controllers\Administrador\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\Administrador\Catalogos\TipoEquipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TipoEquipoController extends Controller
{
    /**
     * Mostrar los tipos de equipo con paginación.
     */
    public function index(): JsonResponse
    {
        $tiposEquipo = TipoEquipo::orderBy('nombre', 'asc')
            ->paginate(10);

        return response()->json($tiposEquipo);
    }

    /**
     * Registrar un nuevo tipo de equipo.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',
                'unique:vaai_tipos_equipo,nombre',
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:255',
            ],

            'estatus' => [
                'nullable',
                'boolean',
            ],
        ], [
            'nombre.required' => 'El nombre del tipo de equipo es obligatorio.',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Estatus por defecto
        |--------------------------------------------------------------------------
        |
        | Todo tipo de equipo nuevo se registra como activo,
        | salvo que se indique expresamente lo contrario.
        |
        */

        $validated['estatus'] =
            $validated['estatus'] ?? true;

        $tipoEquipo = TipoEquipo::create(
            $validated
        );

        return response()->json([
            'success' => true,

            'message' =>
                'Tipo de equipo registrado correctamente.',

            'data' => $tipoEquipo,
        ], 201);
    }

    /**
     * Mostrar un tipo de equipo específico.
     */
    public function show(
        TipoEquipo $tipoEquipo
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'data' => $tipoEquipo,
        ]);
    }

    /**
     * Actualizar un tipo de equipo.
     */
    public function update(
        Request $request,
        TipoEquipo $tipoEquipo
    ): JsonResponse {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'vaai_tipos_equipo',
                    'nombre'
                )->ignore($tipoEquipo->id),
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:255',
            ],
        ], [
            'nombre.required' => 'El nombre del tipo de equipo es obligatorio.',
        ]);

        $tipoEquipo->update(
            $validated
        );

        return response()->json([
            'success' => true,

            'message' =>
                'Tipo de equipo actualizado correctamente.',

            'data' => $tipoEquipo->fresh(),
        ]);
    }

    /**
     * Eliminar un tipo de equipo.
     */
    public function destroy(
        TipoEquipo $tipoEquipo
    ): JsonResponse {
        $tipoEquipo->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Tipo de equipo eliminado correctamente.',
        ]);
    }

    /**
     * Cambiar únicamente el estatus.
     */
    public function cambiarEstatus(
        TipoEquipo $tipoEquipo
    ): JsonResponse {
        $tipoEquipo->estatus =
            !$tipoEquipo->estatus;

        $tipoEquipo->save();

        return response()->json([
            'success' => true,

            'message' => $tipoEquipo->estatus
                ? 'Tipo de equipo activado correctamente.'
                : 'Tipo de equipo desactivado correctamente.',

            'data' => $tipoEquipo->fresh(),
        ]);
    }
}
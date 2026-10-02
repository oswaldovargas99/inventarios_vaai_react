<?php

namespace App\Http\Controllers\Administrador;

use App\Http\Controllers\Controller;
use App\Models\Administrador\Equipo;
use App\Models\Administrador\Traslado;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TrasladoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $traslados = Traslado::with([
            'equipo:id,id_equipo,tipo_equipo_id,modelo_id,numero_serie',
            'equipo.tipoEquipo:id,nombre',
            'equipo.modelo:id,nombre',
        ])->latest()->paginate($request->integer('per_page', 10));

        return response()->json($traslados);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipo_id' => [
                'required',
                'integer',
                Rule::exists('vaai_equipos', 'id')->whereIn('estatus', ['activo', 'no_activo']),
            ],
            'dependencia' => ['required', Rule::in(['piso', 'centro_universitario', 'preparatoria'])],
            'destino' => ['required', 'string', 'max:150'],
        ], [
            'equipo_id.required' => 'Selecciona un equipo.',
            'dependencia.required' => 'Selecciona una dependencia.',
            'destino.required' => 'Selecciona un destino.',
        ]);

        $traslado = Traslado::updateOrCreate(
            ['equipo_id' => $validated['equipo_id']],
            [
                'dependencia' => $validated['dependencia'],
                'destino' => $validated['destino'],
            ]
        );
        $traslado->load([
            'equipo:id,id_equipo,tipo_equipo_id,modelo_id,numero_serie',
            'equipo.tipoEquipo:id,nombre',
            'equipo.modelo:id,nombre',
        ]);

        return response()->json([
            'success' => true,
            'message' => $traslado->wasRecentlyCreated
                ? 'Traslado registrado correctamente.'
                : 'Traslado actualizado correctamente.',
            'data' => $traslado,
        ], $traslado->wasRecentlyCreated ? 201 : 200);
    }
}
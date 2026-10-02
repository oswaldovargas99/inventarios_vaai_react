<?php

namespace App\Http\Controllers\Administrador\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\Administrador\Catalogos\Marca;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MarcaController extends Controller
{
    /**
     * Mostrar listado de marcas.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['buscar' => ['nullable', 'string', 'max:255']]);
        $buscar = trim((string) $request->query('buscar', ''));

        $marcas = Marca::query()
            ->when(
                $buscar !== '',
                function ($query) use ($buscar) {
                    $query->where(
                        'nombre',
                        'like',
                        '%'.$buscar.'%'
                    );
                }
            )
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $marcas,
        ]);
    }

    /**
     * Registrar una nueva marca.
     */
    public function store(Request $request): JsonResponse
    {
        if (is_string($request->input('nombre'))) {
            $request->merge(['nombre' => trim($request->input('nombre'))]);
        }

        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',
                'unique:vaai_cat_marcas,nombre',
            ],

            'estatus' => [
                'nullable',
                'boolean',
            ],
        ], [
            'nombre.required' => 'El nombre de la marca es obligatorio.',
        ]);

        $marca = Marca::create([
            'nombre' => $validated['nombre'],
            'estatus' => $validated['estatus'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Marca registrada correctamente.',
            'data' => $marca,
        ], 201);
    }

    /**
     * Mostrar una marca.
     */
    public function show(Marca $marca): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $marca,
        ]);
    }

    /**
     * Actualizar una marca.
     */
    public function update(
        Request $request,
        Marca $marca
    ): JsonResponse {
        if (is_string($request->input('nombre'))) {
            $request->merge(['nombre' => trim($request->input('nombre'))]);
        }

        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'vaai_cat_marcas',
                    'nombre'
                )->ignore($marca->id),
            ],

            'estatus' => [
                'nullable',
                'boolean',
            ],
        ], [
            'nombre.required' => 'El nombre de la marca es obligatorio.',
        ]);

        $marca->update([
            'nombre' => $validated['nombre'],
            'estatus' => $validated['estatus']
                ?? $marca->estatus,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Marca actualizada correctamente.',
            'data' => $marca,
        ]);
    }

    /**
     * Eliminar una marca.
     */
    public function destroy(Marca $marca): JsonResponse
    {
        try {
            $marca->delete();
        } catch (QueryException $exception) {
            if (! in_array((string) $exception->getCode(), ['23000', '23503'], true)) {
                throw $exception;
            }

            return response()->json([
                'success' => false,
                'message' => 'No es posible eliminar la marca porque tiene información relacionada.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Marca eliminada correctamente.',
        ]);
    }

    /**
     * Cambiar estatus de una marca.
     */
    public function cambiarEstatus(
        Marca $marca
    ): JsonResponse {
        $marca->update([
            'estatus' => ! $marca->estatus,
        ]);

        return response()->json([
            'success' => true,

            'message' => $marca->estatus
                ? 'Marca activada correctamente.'
                : 'Marca desactivada correctamente.',

            'data' => $marca,
        ]);
    }
}

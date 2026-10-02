<?php

namespace App\Http\Controllers\Administrador\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\Administrador\Catalogos\Marca;
use App\Models\Administrador\Catalogos\Modelo;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModeloController extends Controller
{
    /**
     * Mostrar listado de modelos.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'buscar' => ['nullable', 'string', 'max:255'],
            'marca_id' => ['nullable', 'integer', 'min:1'],
            'estatus' => ['nullable', Rule::in(['0', '1', 'true', 'false'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $query = Modelo::query()
            ->with([
                'marca:id,nombre,estatus',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Búsqueda
        |--------------------------------------------------------------------------
        */

        if ($request->filled('buscar')) {
            $buscar = trim($request->buscar);

            $query->where(function ($consulta) use ($buscar) {
                $consulta
                    ->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('descripcion', 'like', "%{$buscar}%")
                    ->orWhereHas('marca', function ($marca) use ($buscar) {
                        $marca->where(
                            'nombre',
                            'like',
                            "%{$buscar}%"
                        );
                    });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filtro por marca
        |--------------------------------------------------------------------------
        */

        if ($request->filled('marca_id')) {
            $query->where(
                'marca_id',
                $request->marca_id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Filtro por estatus
        |--------------------------------------------------------------------------
        */

        if ($request->filled('estatus')) {
            $query->where(
                'estatus',
                filter_var(
                    $request->estatus,
                    FILTER_VALIDATE_BOOLEAN
                )
            );
        }

        $modelos = $query
            ->orderBy('nombre')
            ->paginate(
                $request->integer('per_page', 10)
            )->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $modelos,
        ]);
    }

    /**
     * Crear un modelo.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'marca_id' => [
                'required',
                'integer',
                Rule::exists('vaai_cat_marcas', 'id'),
            ],

            'nombre' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'vaai_cat_modelos',
                    'nombre'
                )->where(
                    fn ($query) =>
                    $query->where(
                        'marca_id',
                        $request->marca_id
                    )
                ),
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:255',
            ],

            'estatus' => [
                'sometimes',
                'boolean',
            ],
        ], [
            'marca_id.required' => 'Selecciona una marca.',
            'nombre.required' => 'El nombre del modelo es obligatorio.',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Validar que la marca esté activa
        |--------------------------------------------------------------------------
        */

        $marca = Marca::findOrFail(
            $validated['marca_id']
        );

        if (!$marca->estatus) {
            return response()->json([
                'success' => false,
                'message' =>
                    'No se puede registrar un modelo en una marca inactiva.',
            ], 422);
        }

        $modelo = Modelo::create([
            'marca_id' =>
                $validated['marca_id'],

            'nombre' =>
                trim($validated['nombre']),

            'descripcion' =>
                isset($validated['descripcion'])
                    ? trim($validated['descripcion'])
                    : null,

            'estatus' =>
                $validated['estatus'] ?? true,
        ]);

        $modelo->load('marca:id,nombre,estatus');

        return response()->json([
            'success' => true,
            'message' =>
                'Modelo registrado correctamente.',
            'data' => $modelo,
        ], 201);
    }

    /**
     * Mostrar un modelo.
     */
    public function show(Modelo $modelo): JsonResponse
    {
        $modelo->load(
            'marca:id,nombre,estatus'
        );

        return response()->json([
            'success' => true,
            'data' => $modelo,
        ]);
    }

    /**
     * Actualizar un modelo.
     */
    public function update(
        Request $request,
        Modelo $modelo
    ): JsonResponse {
        $validated = $request->validate([
            'marca_id' => [
                'required',
                'integer',
                Rule::exists(
                    'vaai_cat_marcas',
                    'id'
                ),
            ],

            'nombre' => [
                'required',
                'string',
                'max:100',

                Rule::unique(
                    'vaai_cat_modelos',
                    'nombre'
                )
                    ->where(
                        fn ($query) =>
                        $query->where(
                            'marca_id',
                            $request->marca_id
                        )
                    )
                    ->ignore($modelo->id),
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:255',
            ],
        ], [
            'marca_id.required' => 'Selecciona una marca.',
            'nombre.required' => 'El nombre del modelo es obligatorio.',
        ]);

        $marca = Marca::findOrFail(
            $validated['marca_id']
        );

        if (!$marca->estatus) {
            return response()->json([
                'success' => false,
                'message' =>
                    'No se puede asignar el modelo a una marca inactiva.',
            ], 422);
        }

        $modelo->update([
            'marca_id' =>
                $validated['marca_id'],

            'nombre' =>
                trim($validated['nombre']),

            'descripcion' =>
                isset($validated['descripcion'])
                    ? trim($validated['descripcion'])
                    : null,
        ]);

        $modelo->load('marca:id,nombre,estatus');

        return response()->json([
            'success' => true,
            'message' =>
                'Modelo actualizado correctamente.',
            'data' => $modelo,
        ]);
    }

    /**
     * Eliminar un modelo.
     */
    public function destroy(
        Modelo $modelo
    ): JsonResponse {
        try {
            $modelo->delete();

            return response()->json([
                'success' => true,
                'message' =>
                    'Modelo eliminado correctamente.',
            ]);
        } catch (QueryException $exception) {
            if (! in_array((string) $exception->getCode(), ['23000', '23503'], true)) {
                throw $exception;
            }

            return response()->json([
                'success' => false,
                'message' =>
                    'No es posible eliminar el modelo porque tiene información relacionada.',
            ], 409);
        }
    }

    /**
     * Activar o desactivar un modelo.
     */
    public function cambiarEstatus(
        Modelo $modelo
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | Validar marca activa al activar modelo
        |--------------------------------------------------------------------------
        */

        if (!$modelo->estatus) {
            $modelo->load('marca');

            if (!$modelo->marca?->estatus) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'No se puede activar el modelo porque su marca está inactiva.',
                ], 422);
            }
        }

        $modelo->estatus = !$modelo->estatus;
        $modelo->save();

        $modelo->load(
            'marca:id,nombre,estatus'
        );

        return response()->json([
            'success' => true,

            'message' => $modelo->estatus
                ? 'Modelo activado correctamente.'
                : 'Modelo desactivado correctamente.',

            'data' => $modelo,
        ]);
    }
}

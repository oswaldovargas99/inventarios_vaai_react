<?php

namespace App\Http\Controllers\Administrador;

use App\Http\Controllers\Controller;
use App\Models\Administrador\Dependencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DependenciaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'buscar' => ['nullable', 'string', 'max:255'],
        ]);

        $buscar = trim((string) $request->query('buscar', ''));
        $dependencias = Dependencia::query()
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($consulta) use ($buscar) {
                    $consulta
                        ->where('nombre', 'like', '%'.$buscar.'%')
                        ->orWhere('siglas', 'like', '%'.$buscar.'%')
                        ->orWhere('municipio', 'like', '%'.$buscar.'%');
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $dependencias,
        ]);
    }

    public function paises(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => DB::table('vaai_paises')
                ->select(['id', 'nombre', 'codigo_iso2', 'codigo_iso3'])
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function entidadesFederativas(Request $request): JsonResponse
    {
        $pais = trim((string) $request->query('pais', 'México'));
        $entidades = DB::table('vaai_entidades_federativas as entidades')
            ->join('vaai_paises as paises', 'paises.id', '=', 'entidades.pais_id')
            ->where('paises.nombre', $pais)
            ->orderBy('entidades.nombre')
            ->pluck('entidades.nombre');

        return response()->json([
            'success' => true,
            'data' => $entidades,
        ]);
    }

    public function buscarCodigoPostal(string $codigoPostal): JsonResponse
    {
        $codigoPostal = trim($codigoPostal);
        if (!preg_match('/^\d{5}$/', $codigoPostal)) {
            return response()->json([
                'message' => 'El código postal debe contener cinco dígitos.',
            ], 422);
        }

        $registros = DB::table('postal_codes')
            ->select(['d_codigo', 'd_asenta', 'D_mnpio', 'd_estado'])
            ->where('d_codigo', $codigoPostal)
            ->orderBy('d_asenta')
            ->get();

        if ($registros->isEmpty()) {
            return response()->json([
                'message' => 'No se encontró información para ese código postal.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'codigo_postal' => $codigoPostal,
                'estado' => $registros->first()->d_estado,
                'municipio' => $registros->first()->D_mnpio,
                'colonias' => $registros->pluck('d_asenta')->unique()->values(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $this->validarDatos($request);
        $validado['estatus'] = $validado['estatus'] ?? 'activo';
        $validado['vigente'] = $validado['estatus'] === 'activo';

        $dependencia = Dependencia::create([
            ...$validado,
            'vigente' => $validado['vigente'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dependencia registrada correctamente.',
            'data' => $dependencia,
        ], 201);
    }

    public function update(Request $request, Dependencia $dependencia): JsonResponse
    {
        $validado = $this->validarDatos($request, $dependencia);
        $validado['vigente'] = $validado['estatus'] === 'activo';
        $dependencia->update($validado);

        return response()->json([
            'success' => true,
            'message' => 'Dependencia actualizada correctamente.',
            'data' => $dependencia->fresh(),
        ]);
    }

    public function destroy(Dependencia $dependencia): JsonResponse
    {
        $dependencia->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dependencia eliminada correctamente.',
        ]);
    }

    private function validarDatos(Request $request, ?Dependencia $dependencia = null): array
    {
        $datos = $request->all();
        foreach (['nombre_rector', 'tipo_dependencia', 'nombre', 'siglas', 'direccion', 'telefonos', 'pais', 'colonia', 'codigo_postal', 'municipio', 'estado', 'sitio_web', 'estatus'] as $campo) {
            if (isset($datos[$campo]) && is_string($datos[$campo])) {
                $datos[$campo] = trim($datos[$campo]);
            }
        }
        $request->merge($datos);

        $reglas = [
            'nombre_rector' => ['required', 'string', 'max:150'],
            'tipo_dependencia' => ['required', 'string', 'max:50'],
            'nombre' => ['required', 'string', 'max:150'],
            'siglas' => ['required', 'string', 'max:20', Rule::unique('vaai_dependencias', 'siglas')->ignore($dependencia?->id)],
            'direccion' => ['required', 'string', 'max:255'],
            'telefonos' => ['required', 'string', 'max:100'],
            'sitio_web' => ['nullable', 'url', 'max:255'],
            'pais' => ['required', 'string', Rule::exists('vaai_paises', 'nombre')],
            'colonia' => ['required', 'string', 'max:100'],
            'codigo_postal' => ['required', 'string', 'max:10'],
            'municipio' => ['required', 'string', 'max:100'],
            'estado' => ['required', 'string', 'max:150'],
            'estatus' => ['sometimes', 'string', Rule::in(['activo', 'inactivo', 'pendiente'])],
        ];
        if (($datos['pais'] ?? '') === 'México') {
            $reglas['estado'][] = Rule::exists('vaai_entidades_federativas', 'nombre')
                ->where('pais_id', DB::table('vaai_paises')->where('nombre', 'México')->value('id'));
        }

        return $request->validate($reglas, [
            'nombre_rector.required' => 'El nombre del rector es obligatorio.',
            'tipo_dependencia.required' => 'El tipo de dependencia es obligatorio.',
            'nombre.required' => 'El nombre de la dependencia es obligatorio.',
            'siglas.required' => 'Las siglas son obligatorias.',
            'direccion.required' => 'La dirección es obligatoria.',
            'telefonos.required' => 'El teléfono es obligatorio.',
            'pais.required' => 'El país es obligatorio.',
            'colonia.required' => 'La colonia es obligatoria.',
            'codigo_postal.required' => 'El código postal es obligatorio.',
            'municipio.required' => 'El municipio es obligatorio.',
            'estado.required' => 'El estado es obligatorio.',
            'pais.exists' => 'Selecciona un país válido.',
            'estado.exists' => 'Selecciona una entidad federativa válida para México.',
            'siglas.unique' => 'Las siglas ya están registradas.',
            'sitio_web.url' => 'Escribe una dirección web válida.',
            'estatus.in' => 'Selecciona un estatus válido.',
        ]);
    }
}
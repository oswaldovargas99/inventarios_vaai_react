<?php

namespace App\Http\Controllers\Administrador\Catalogos;

use App\Http\Controllers\Controller;
use App\Models\CentroUniversitario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CentroUniversitarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $centros = CentroUniversitario::where('activo', true)
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($consulta) use ($buscar) {
                    $consulta
                        ->where('nombre', 'like', '%' . $buscar . '%')
                        ->orWhere('abreviatura', 'like', '%' . $buscar . '%');
                });
            })
            ->orderBy('nombre', 'asc')
            ->limit(20)
            ->get(['id', 'nombre', 'abreviatura']);

        return response()->json([
            'success' => true,
            'data' => $centros,
        ]);
    }

    public function show(CentroUniversitario $centroUniversitario): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $centroUniversitario,
        ]);
    }
}
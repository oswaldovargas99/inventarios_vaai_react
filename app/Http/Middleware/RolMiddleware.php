<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolMiddleware
{
    /**
     * Verifica que el usuario autenticado tenga uno de los roles permitidos.
     *
     * Ejemplos:
     *
     * ->middleware('rol:Administrador')
     *
     * ->middleware('rol:Administrador,Patrimonio')
     */
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
    ): Response {

        /*
        |--------------------------------------------------------------------------
        | Verificar usuario autenticado
        |--------------------------------------------------------------------------
        */

        $usuario = $request->user();

        if (! $usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado.',
            ], 401);
        }

        $rol = $usuario->rol;

        /*
        |--------------------------------------------------------------------------
        | Verificar rol autorizado
        |--------------------------------------------------------------------------
        */

        if (! in_array($rol->nombre, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Acceso autorizado
        |--------------------------------------------------------------------------
        */

        return $next($request);
    }
}

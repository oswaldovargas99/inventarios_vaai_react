<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UsuarioRolActivoMiddleware
{
    /**
     * Verifica que la cuenta autenticada y su rol continúen activos.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado.',
            ], 401);
        }

        if (! $usuario->activo) {
            return $this->rechazarAcceso(
                $request,
                'El usuario se encuentra inactivo.'
            );
        }

        $rol = $usuario->rol;

        if (! $rol) {
            return $this->rechazarAcceso(
                $request,
                'El usuario no tiene un rol asignado.'
            );
        }

        if (! $rol->activo) {
            return $this->rechazarAcceso(
                $request,
                'El rol asignado al usuario se encuentra inactivo.'
            );
        }

        return $next($request);
    }

    /**
     * Invalida la sesión SPA actual y devuelve una respuesta consistente.
     */
    private function rechazarAcceso(Request $request, string $message): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => false,
            'message' => $message,
        ], 403);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Iniciar sesión.
     */
    public function login(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Validar datos recibidos
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'codigo' => [
                'required',
                'string',
            ],

            'password' => [
                'required',
                'string',
            ],
        ], [
            'codigo.required' => 'El código de trabajador es obligatorio.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Buscar usuario
        |--------------------------------------------------------------------------
        |
        | Se carga también la relación con el rol para validar que
        | el usuario tenga un rol asignado y que dicho rol esté activo.
        |
        */

        $usuario = Usuario::with('rol')
            ->where(
                'codigo',
                $validated['codigo']
            )
            ->first();


        /*
        |--------------------------------------------------------------------------
        | Validar existencia del usuario
        |--------------------------------------------------------------------------
        */

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' =>
                    'El código de trabajador o la contraseña son incorrectos.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Validar contraseña
        |--------------------------------------------------------------------------
        */

        if (
            !Hash::check(
                $validated['password'],
                $usuario->password
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'El código de trabajador o la contraseña son incorrectos.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Validar que el usuario esté activo
        |--------------------------------------------------------------------------
        */

        if (!$usuario->activo) {
            return response()->json([
                'success' => false,
                'message' =>
                    'El usuario se encuentra inactivo.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Validar que tenga un rol asignado
        |--------------------------------------------------------------------------
        */

        if (!$usuario->rol) {
            return response()->json([
                'success' => false,
                'message' =>
                    'El usuario no tiene un rol asignado.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Validar que el rol esté activo
        |--------------------------------------------------------------------------
        */

        if (!$usuario->rol->activo) {
            return response()->json([
                'success' => false,
                'message' =>
                    'El rol asignado al usuario se encuentra inactivo.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Autenticar usuario
        |--------------------------------------------------------------------------
        |
        | Sanctum utiliza el guard web para la autenticación SPA
        | mediante cookies de sesión.
        |
        */

        Auth::guard('web')->login($usuario);


        /*
        |--------------------------------------------------------------------------
        | Regenerar sesión
        |--------------------------------------------------------------------------
        |
        | Se regenera el identificador de sesión después del login
        | para prevenir ataques de fijación de sesión.
        |
        */

        $request->session()->regenerate();


        /*
        |--------------------------------------------------------------------------
        | Respuesta
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Inicio de sesión correcto.',

            'usuario' =>
                $usuario->fresh()->load('rol'),
        ]);
    }


    /**
     * Obtener información del usuario autenticado.
     */
    public function usuario(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Obtener usuario autenticado
        |--------------------------------------------------------------------------
        */

        $usuario = $request->user();


        /*
        |--------------------------------------------------------------------------
        | Validar sesión
        |--------------------------------------------------------------------------
        */

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Usuario no autenticado.',
            ], 401);
        }


        /*
        |--------------------------------------------------------------------------
        | Cargar rol
        |--------------------------------------------------------------------------
        */

        $usuario->load('rol');


        return response()->json([
            'success' => true,
            'usuario' => $usuario,
        ]);
    }


    /**
     * Cerrar sesión.
     */
    public function logout(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Cerrar sesión del usuario
        |--------------------------------------------------------------------------
        */

        Auth::guard('web')->logout();


        /*
        |--------------------------------------------------------------------------
        | Invalidar sesión
        |--------------------------------------------------------------------------
        |
        | Elimina la sesión que estaba asociada al usuario.
        |
        */

        $request->session()->invalidate();


        /*
        |--------------------------------------------------------------------------
        | Regenerar token CSRF
        |--------------------------------------------------------------------------
        */

        $request->session()->regenerateToken();


        /*
        |--------------------------------------------------------------------------
        | Respuesta
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' =>
                'Sesión cerrada correctamente.',
        ]);
    }
}
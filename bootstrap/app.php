<?php

use App\Http\Middleware\RolMiddleware;
use App\Http\Middleware\UsuarioRolActivoMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        /*
        |--------------------------------------------------------------------------
        | Sanctum SPA Authentication
        |--------------------------------------------------------------------------
        |
        | Permite que las rutas API utilicen autenticación mediante
        | cookies y sesiones para la aplicación React.
        |
        */

        $middleware->statefulApi();

        /*
        |--------------------------------------------------------------------------
        | Middleware personalizados
        |--------------------------------------------------------------------------
        |
        | Se registra el alias "rol" para poder proteger rutas según
        | el rol asignado al usuario autenticado.
        |
        */

        $middleware->alias([
            'rol' => RolMiddleware::class,
            'usuario.rol.activo' => UsuarioRolActivoMiddleware::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();

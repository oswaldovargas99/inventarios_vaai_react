<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Administrador\Catalogos\TipoEquipoController;
use App\Http\Controllers\Administrador\Catalogos\MarcaController;
use App\Http\Controllers\Administrador\Catalogos\ModeloController;
use App\Http\Controllers\Administrador\EquipoController;
use App\Http\Controllers\Administrador\TrasladoController;
use App\Http\Controllers\Administrador\ProveedorController;
use App\Http\Controllers\Administrador\CotizacionController;
use App\Http\Controllers\Administrador\DependenciaController;
use App\Http\Controllers\Administrador\Catalogos\CentroUniversitarioController;
use App\Http\Controllers\Administrador\UsuarioController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rutas de la API del Sistema de Inventarios VAAI.
|
*/

/*
|--------------------------------------------------------------------------
| Autenticación pública
|--------------------------------------------------------------------------
*/

Route::post('/login', [
    AuthController::class,
    'login',
]);

/*
|--------------------------------------------------------------------------
| Rutas protegidas por autenticación
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Cerrar sesión
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [
        AuthController::class,
        'logout',
    ]);

    Route::middleware('usuario.rol.activo')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Usuario autenticado
        |--------------------------------------------------------------------------
        */

        Route::get('/user', [
            AuthController::class,
            'usuario',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Catálogo: Tipos de Equipo
        |--------------------------------------------------------------------------
        */

        Route::prefix('tipos-equipo')->group(function () {
            Route::middleware(
                'rol:Administrador,Patrimonio,Secretario,Usuario'
            )->group(function () {
                Route::get('/', [
                    TipoEquipoController::class,
                    'index',
                ]);

                Route::get('/{tipoEquipo}', [
                    TipoEquipoController::class,
                    'show',
                ]);
            });

            Route::middleware(
                'rol:Administrador,Patrimonio'
            )->group(function () {
                Route::post('/', [
                    TipoEquipoController::class,
                    'store',
                ]);

                Route::put('/{tipoEquipo}', [
                    TipoEquipoController::class,
                    'update',
                ]);

                Route::patch('/{tipoEquipo}/estatus', [
                    TipoEquipoController::class,
                    'cambiarEstatus',
                ]);
            });

            Route::delete('/{tipoEquipo}', [
                TipoEquipoController::class,
                'destroy',
            ])->middleware('rol:Administrador');
        });

        /*
        |--------------------------------------------------------------------------
        | Catálogo: Marcas
        |--------------------------------------------------------------------------
        */

        Route::prefix('marcas')->group(function () {
            Route::middleware(
                'rol:Administrador,Patrimonio,Secretario,Usuario'
            )->group(function () {
                Route::get('/', [
                    MarcaController::class,
                    'index',
                ]);

                Route::get('/{marca}', [
                    MarcaController::class,
                    'show',
                ]);
            });

            Route::middleware(
                'rol:Administrador,Patrimonio'
            )->group(function () {
                Route::post('/', [
                    MarcaController::class,
                    'store',
                ]);

                Route::put('/{marca}', [
                    MarcaController::class,
                    'update',
                ]);

                Route::patch('/{marca}/estatus', [
                    MarcaController::class,
                    'cambiarEstatus',
                ]);
            });

            Route::delete('/{marca}', [
                MarcaController::class,
                'destroy',
            ])->middleware('rol:Administrador');
        });

        /*
        |--------------------------------------------------------------------------
        | Catálogo: Modelos
        |--------------------------------------------------------------------------
        */

        Route::prefix('modelos')->group(function () {
            Route::middleware(
                'rol:Administrador,Patrimonio,Secretario,Usuario'
            )->group(function () {
                Route::get('/', [
                    ModeloController::class,
                    'index',
                ]);

                Route::get('/{modelo}', [
                    ModeloController::class,
                    'show',
                ]);
            });

            Route::middleware(
                'rol:Administrador,Patrimonio'
            )->group(function () {
                Route::post('/', [
                    ModeloController::class,
                    'store',
                ]);

                Route::put('/{modelo}', [
                    ModeloController::class,
                    'update',
                ]);

                Route::patch('/{modelo}/estatus', [
                    ModeloController::class,
                    'cambiarEstatus',
                ]);
            });

            Route::delete('/{modelo}', [
                ModeloController::class,
                'destroy',
            ])->middleware('rol:Administrador');
        });

        /*
        |--------------------------------------------------------------------------
        | Catálogo: Proveedores
        |--------------------------------------------------------------------------
        */
        Route::get('proveedores/{proveedor}/constancia', [ProveedorController::class, 'verConstancia']);
        Route::prefix('proveedores')->group(function () {
            Route::middleware(
                'rol:Administrador,Patrimonio,Secretario,Usuario'
            )->group(function () {
                Route::get('/', [
                    ProveedorController::class,
                    'index',
                ]);

                Route::get('/{proveedor}', [
                    ProveedorController::class,
                    'show',
                ]);
            });

            Route::middleware(
                'rol:Administrador,Patrimonio'
            )->group(function () {
                Route::post('/', [
                    ProveedorController::class,
                    'store',
                ]);

                Route::match(['put', 'post'], '/{proveedor}', [
                    ProveedorController::class,
                    'update',
                ]);

                Route::patch('/{proveedor}/estatus', [
                    ProveedorController::class,
                    'cambiarEstatus',
                ]);
            });

            Route::delete('/{proveedor}', [
                ProveedorController::class,
                'destroy',
            ])->middleware('rol:Administrador');
        });

        /*
        |--------------------------------------------------------------------------
        | Catálogo: Cotizaciones
        |--------------------------------------------------------------------------
        */

        Route::prefix('cotizaciones')->group(function () {
            Route::middleware(
                'rol:Administrador,Patrimonio,Secretario,Usuario'
            )->group(function () {
                Route::get('/', [
                    CotizacionController::class,
                    'index',
                ]);

                Route::get('/{cotizacion}', [
                    CotizacionController::class,
                    'show',
                ]);

                Route::get('/{cotizacion}/descargar', [
                    CotizacionController::class,
                    'descargarArchivo',
                ]);
            });

            Route::middleware(
                'rol:Administrador,Patrimonio'
            )->group(function () {
                Route::post('/', [
                    CotizacionController::class,
                    'store',
                ]);

                Route::match(['put', 'post'], '/{cotizacion}', [
                    CotizacionController::class,
                    'update',
                ]);

                Route::patch('/{cotizacion}/estatus', [
                    CotizacionController::class,
                    'cambiarEstatus',
                ]);
            });

            Route::delete('/{cotizacion}', [
                CotizacionController::class,
                'destroy',
            ])->middleware('rol:Administrador');
        });

        /*
        |--------------------------------------------------------------------------
        | Alta de equipos
        |--------------------------------------------------------------------------
        */

        Route::prefix('equipos')->group(function () {
            Route::middleware(
                'rol:Administrador,Patrimonio,Secretario,Usuario'
            )->group(function () {
                Route::get('/', [EquipoController::class, 'index']);
                Route::get('/traslados', [TrasladoController::class, 'index']);
                Route::get('/{equipo}', [EquipoController::class, 'show']);
            });

            Route::post('/', [EquipoController::class, 'store'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::post('/traslados', [TrasladoController::class, 'store'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::patch('/{equipo}', [EquipoController::class, 'update'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::delete('/{equipo}', [EquipoController::class, 'destroy'])
                ->middleware('rol:Administrador');
        });

        Route::prefix('dependencias')->group(function () {
            Route::get('/', [DependenciaController::class, 'index'])
                ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');

            Route::get('/paises', [DependenciaController::class, 'paises'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::get('/entidades-federativas', [DependenciaController::class, 'entidadesFederativas'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::get('/codigo-postal/{codigoPostal}', [DependenciaController::class, 'buscarCodigoPostal'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::post('/', [DependenciaController::class, 'store'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::patch('/{dependencia}', [DependenciaController::class, 'update'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::delete('/{dependencia}', [DependenciaController::class, 'destroy'])
                ->middleware('rol:Administrador');
        });

        Route::prefix('centros-universitarios')->group(function () {
            Route::get('/', [CentroUniversitarioController::class, 'index'])
                ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');

            Route::get('/{centroUniversitario}', [CentroUniversitarioController::class, 'show'])
                ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');
        });

        Route::prefix('usuarios')->group(function () {
            Route::get('/', [UsuarioController::class, 'index'])
                ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');

            Route::post('/', [UsuarioController::class, 'store'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::patch('/{usuario}', [UsuarioController::class, 'update'])
                ->middleware('rol:Administrador,Patrimonio');

            Route::delete('/{usuario}', [UsuarioController::class, 'destroy'])
                ->middleware('rol:Administrador');
        });

    });

});
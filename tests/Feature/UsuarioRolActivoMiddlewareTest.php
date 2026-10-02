<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\Middleware\StartSession;
use Tests\TestCase;

class UsuarioRolActivoMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app['router']->prependMiddlewareToGroup(
            'api',
            StartSession::class
        );

        $this->withHeaders([
            'Origin' => 'http://localhost',
            'Referer' => 'http://localhost/',
        ]);
    }

    public function test_usuario_activo_con_rol_activo_puede_acceder(): void
    {
        [$usuario] = $this->crearUsuario();

        $this->actingAs($usuario, 'web')
            ->getJson('/api/marcas')
            ->assertOk();
    }

    public function test_usuario_inactivo_no_puede_acceder(): void
    {
        [$usuario] = $this->crearUsuario(usuarioActivo: false);

        $this->actingAs($usuario, 'web')
            ->getJson('/api/marcas')
            ->assertForbidden()
            ->assertExactJson([
                'success' => false,
                'message' => 'El usuario se encuentra inactivo.',
            ]);

        $this->assertGuest('web');
    }

    public function test_rol_inactivo_no_puede_acceder(): void
    {
        [$usuario] = $this->crearUsuario(rolActivo: false);

        $this->actingAs($usuario, 'web')
            ->getJson('/api/marcas')
            ->assertForbidden()
            ->assertExactJson([
                'success' => false,
                'message' => 'El rol asignado al usuario se encuentra inactivo.',
            ]);

        $this->assertGuest('web');
    }

    public function test_usuario_desactivado_despues_de_autenticarse_pierde_acceso(): void
    {
        [$usuario] = $this->crearUsuario();
        $this->iniciarSesion($usuario);

        $usuario->update(['activo' => false]);
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/marcas')
            ->assertForbidden()
            ->assertJsonPath('message', 'El usuario se encuentra inactivo.');

        $this->assertGuest('web');
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/marcas')->assertUnauthorized();
    }

    public function test_rol_desactivado_despues_de_autenticarse_pierde_acceso(): void
    {
        [$usuario, $rol] = $this->crearUsuario();
        $this->iniciarSesion($usuario);

        $rol->update(['activo' => false]);
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/marcas')
            ->assertForbidden()
            ->assertJsonPath(
                'message',
                'El rol asignado al usuario se encuentra inactivo.'
            );

        $this->assertGuest('web');
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/marcas')->assertUnauthorized();
    }

    public function test_api_user_respeta_la_validacion_de_estado(): void
    {
        [$usuario] = $this->crearUsuario();
        $this->actingAs($usuario, 'web');

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('usuario.id', $usuario->id);

        $usuario->update(['activo' => false]);

        $this->getJson('/api/user')
            ->assertForbidden()
            ->assertJsonPath('message', 'El usuario se encuentra inactivo.');
    }

    public function test_logout_sigue_disponible_si_el_usuario_fue_desactivado(): void
    {
        [$usuario] = $this->crearUsuario();
        $this->iniciarSesion($usuario);

        $usuario->update(['activo' => false]);
        $this->app['auth']->forgetGuards();

        $this->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertGuest('web');
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    private function crearUsuario(
        bool $usuarioActivo = true,
        bool $rolActivo = true
    ): array {
        $rol = Rol::create([
            'nombre' => 'Administrador',
            'descripcion' => null,
            'activo' => $rolActivo,
        ]);

        $usuario = Usuario::create([
            'rol_id' => $rol->id,
            'codigo' => 'USR-001',
            'nombre' => 'Usuario de prueba',
            'password' => 'password',
            'activo' => $usuarioActivo,
        ]);

        return [$usuario, $rol];
    }

    private function iniciarSesion(Usuario $usuario): void
    {
        $this->withSession([]);

        $this->postJson('/api/login', [
            'codigo' => $usuario->codigo,
            'password' => 'password',
        ])->assertOk();
    }
}

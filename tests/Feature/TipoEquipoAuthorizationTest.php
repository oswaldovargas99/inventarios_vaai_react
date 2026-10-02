<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Administrador\Catalogos\TipoEquipo;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TipoEquipoAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('permisosLectura')]
    public function test_rol_puede_listar_tipos_de_equipo_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);

        $respuesta = $this->getJson('/api/tipos-equipo');

        $permitido
            ? $respuesta->assertOk()
            : $respuesta->assertForbidden();
    }

    #[DataProvider('permisosLectura')]
    public function test_rol_puede_consultar_tipo_de_equipo_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $tipoEquipo = $this->crearTipoEquipo();

        $respuesta = $this->getJson("/api/tipos-equipo/{$tipoEquipo->id}");

        $permitido
            ? $respuesta->assertOk()->assertJsonPath('data.id', $tipoEquipo->id)
            : $respuesta->assertForbidden();
    }

    #[DataProvider('permisosEscritura')]
    public function test_rol_puede_crear_tipo_de_equipo_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);

        $respuesta = $this->postJson('/api/tipos-equipo', [
            'nombre' => 'Computadora',
            'descripcion' => 'Equipo de escritorio',
        ]);

        if ($permitido) {
            $respuesta->assertCreated();
            $this->assertDatabaseHas('vaai_tipos_equipo', [
                'nombre' => 'Computadora',
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseMissing('vaai_tipos_equipo', [
            'nombre' => 'Computadora',
        ]);
    }

    #[DataProvider('permisosEscritura')]
    public function test_rol_puede_editar_tipo_de_equipo_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $tipoEquipo = $this->crearTipoEquipo();

        $respuesta = $this->putJson("/api/tipos-equipo/{$tipoEquipo->id}", [
            'nombre' => 'Computadora actualizada',
            'descripcion' => 'Descripción actualizada',
        ]);

        if ($permitido) {
            $respuesta->assertOk();
            $this->assertDatabaseHas('vaai_tipos_equipo', [
                'id' => $tipoEquipo->id,
                'nombre' => 'Computadora actualizada',
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseHas('vaai_tipos_equipo', [
            'id' => $tipoEquipo->id,
            'nombre' => 'Tipo inicial',
        ]);
    }

    #[DataProvider('permisosEscritura')]
    public function test_rol_puede_cambiar_estatus_de_tipo_de_equipo_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $tipoEquipo = $this->crearTipoEquipo();

        $respuesta = $this->patchJson(
            "/api/tipos-equipo/{$tipoEquipo->id}/estatus"
        );

        if ($permitido) {
            $respuesta->assertOk();
            $this->assertDatabaseHas('vaai_tipos_equipo', [
                'id' => $tipoEquipo->id,
                'estatus' => false,
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseHas('vaai_tipos_equipo', [
            'id' => $tipoEquipo->id,
            'estatus' => true,
        ]);
    }

    #[DataProvider('permisosEliminacion')]
    public function test_rol_puede_eliminar_tipo_de_equipo_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $tipoEquipo = $this->crearTipoEquipo();

        $respuesta = $this->deleteJson("/api/tipos-equipo/{$tipoEquipo->id}");

        if ($permitido) {
            $respuesta->assertOk();
            $this->assertDatabaseMissing('vaai_tipos_equipo', [
                'id' => $tipoEquipo->id,
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseHas('vaai_tipos_equipo', [
            'id' => $tipoEquipo->id,
        ]);
    }

    public static function permisosLectura(): array
    {
        return [
            'Administrador' => ['Administrador', true],
            'Patrimonio' => ['Patrimonio', true],
            'Secretario' => ['Secretario', true],
            'Usuario' => ['Usuario', true],
        ];
    }

    public static function permisosEscritura(): array
    {
        return [
            'Administrador' => ['Administrador', true],
            'Patrimonio' => ['Patrimonio', true],
            'Secretario' => ['Secretario', false],
            'Usuario' => ['Usuario', false],
        ];
    }

    public static function permisosEliminacion(): array
    {
        return [
            'Administrador' => ['Administrador', true],
            'Patrimonio' => ['Patrimonio', false],
            'Secretario' => ['Secretario', false],
            'Usuario' => ['Usuario', false],
        ];
    }

    private function autenticarComo(string $nombreRol): Usuario
    {
        $rol = Rol::create([
            'nombre' => $nombreRol,
            'descripcion' => null,
            'activo' => true,
        ]);

        $usuario = Usuario::create([
            'rol_id' => $rol->id,
            'codigo' => 'USR-001',
            'nombre' => 'Usuario de prueba',
            'password' => 'password',
            'activo' => true,
        ]);

        $this->actingAs($usuario, 'web');

        return $usuario;
    }

    private function crearTipoEquipo(): TipoEquipo
    {
        return TipoEquipo::create([
            'nombre' => 'Tipo inicial',
            'descripcion' => 'Descripción inicial',
            'estatus' => true,
        ]);
    }
}

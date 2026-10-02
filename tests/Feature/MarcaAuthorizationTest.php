<?php

namespace Tests\Feature;

use App\Models\Administrador\Catalogos\Marca;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class MarcaAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('permisosLectura')]
    public function test_rol_puede_listar_marcas_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);

        $respuesta = $this->getJson('/api/marcas');

        $permitido
            ? $respuesta->assertOk()
            : $respuesta->assertForbidden();
    }

    #[DataProvider('permisosLectura')]
    public function test_rol_puede_consultar_marca_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $marca = $this->crearMarca();

        $respuesta = $this->getJson("/api/marcas/{$marca->id}");

        $permitido
            ? $respuesta->assertOk()->assertJsonPath('data.id', $marca->id)
            : $respuesta->assertForbidden();
    }

    #[DataProvider('permisosEscritura')]
    public function test_rol_puede_crear_marca_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);

        $respuesta = $this->postJson('/api/marcas', [
            'nombre' => 'Dell',
        ]);

        if ($permitido) {
            $respuesta->assertCreated();
            $this->assertDatabaseHas('vaai_cat_marcas', [
                'nombre' => 'Dell',
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseMissing('vaai_cat_marcas', [
            'nombre' => 'Dell',
        ]);
    }

    #[DataProvider('permisosEscritura')]
    public function test_rol_puede_editar_marca_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $marca = $this->crearMarca();

        $respuesta = $this->putJson("/api/marcas/{$marca->id}", [
            'nombre' => 'Marca actualizada',
        ]);

        if ($permitido) {
            $respuesta->assertOk();
            $this->assertDatabaseHas('vaai_cat_marcas', [
                'id' => $marca->id,
                'nombre' => 'Marca actualizada',
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseHas('vaai_cat_marcas', [
            'id' => $marca->id,
            'nombre' => 'Marca inicial',
        ]);
    }

    #[DataProvider('permisosEscritura')]
    public function test_rol_puede_cambiar_estatus_de_marca_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $marca = $this->crearMarca();

        $respuesta = $this->patchJson("/api/marcas/{$marca->id}/estatus");

        if ($permitido) {
            $respuesta->assertOk();
            $this->assertDatabaseHas('vaai_cat_marcas', [
                'id' => $marca->id,
                'estatus' => false,
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseHas('vaai_cat_marcas', [
            'id' => $marca->id,
            'estatus' => true,
        ]);
    }

    #[DataProvider('permisosEliminacion')]
    public function test_rol_puede_eliminar_marca_segun_matriz(
        string $rol,
        bool $permitido
    ): void {
        $this->autenticarComo($rol);
        $marca = $this->crearMarca();

        $respuesta = $this->deleteJson("/api/marcas/{$marca->id}");

        if ($permitido) {
            $respuesta->assertOk();
            $this->assertDatabaseMissing('vaai_cat_marcas', [
                'id' => $marca->id,
            ]);

            return;
        }

        $respuesta->assertForbidden();
        $this->assertDatabaseHas('vaai_cat_marcas', [
            'id' => $marca->id,
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

    private function crearMarca(): Marca
    {
        return Marca::create([
            'nombre' => 'Marca inicial',
            'estatus' => true,
        ]);
    }
}

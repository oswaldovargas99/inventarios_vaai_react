<?php

namespace Tests\Feature;

use App\Models\Administrador\Catalogos\Marca;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarcaCatalogoTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_puede_listar_marcas_paginadas_de_diez_en_diez(): void
    {
        $this->autenticarComo('Administrador');

        foreach (range(1, 11) as $indice) {
            Marca::create([
                'nombre' => sprintf('Marca %02d', $indice),
                'estatus' => true,
            ]);
        }

        $this->getJson('/api/marcas')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.per_page', 10)
            ->assertJsonCount(10, 'data.data');
    }

    public function test_usuario_puede_listar_marcas_pero_no_puede_crearlas(): void
    {
        $this->autenticarComo('Usuario');

        $this->getJson('/api/marcas')->assertOk();
        $this->postJson('/api/marcas', ['nombre' => 'Dell'])
            ->assertForbidden();
    }

    public function test_administrador_puede_buscar_marcas(): void
    {
        $this->autenticarComo('Administrador');
        Marca::create(['nombre' => 'Dell', 'estatus' => true]);
        Marca::create(['nombre' => 'Lenovo', 'estatus' => true]);

        $this->getJson('/api/marcas?buscar=Dell')
            ->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.nombre', 'Dell');
    }

    public function test_administrador_puede_crear_una_marca(): void
    {
        $this->autenticarComo('Administrador');

        $this->postJson('/api/marcas', ['nombre' => '  Dell  '])
            ->assertCreated()
            ->assertJsonPath('data.nombre', 'Dell')
            ->assertJsonPath('data.estatus', true);

        $this->assertDatabaseHas('vaai_cat_marcas', ['nombre' => 'Dell']);
    }

    public function test_nombre_de_marca_debe_ser_unico(): void
    {
        $this->autenticarComo('Administrador');
        Marca::create(['nombre' => 'Dell', 'estatus' => true]);

        $this->postJson('/api/marcas', ['nombre' => ' Dell '])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('nombre');
    }

    public function test_administrador_puede_editar_una_marca(): void
    {
        $this->autenticarComo('Administrador');
        $marca = Marca::create(['nombre' => 'Dell', 'estatus' => true]);

        $this->putJson("/api/marcas/{$marca->id}", ['nombre' => 'Lenovo'])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Lenovo');
    }

    public function test_edicion_permite_conservar_el_mismo_nombre(): void
    {
        $this->autenticarComo('Administrador');
        $marca = Marca::create(['nombre' => 'Dell', 'estatus' => true]);

        $this->putJson("/api/marcas/{$marca->id}", ['nombre' => ' Dell '])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Dell');
    }

    public function test_administrador_puede_cambiar_el_estatus(): void
    {
        $this->autenticarComo('Administrador');
        $marca = Marca::create(['nombre' => 'Dell', 'estatus' => true]);

        $this->patchJson("/api/marcas/{$marca->id}/estatus")
            ->assertOk()
            ->assertJsonPath('data.estatus', false);

        $this->assertDatabaseHas('vaai_cat_marcas', [
            'id' => $marca->id,
            'estatus' => false,
        ]);
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
            'codigo' => fake()->unique()->numerify('#######'),
            'nombre' => 'Usuario de prueba',
            'password' => 'password',
            'activo' => true,
        ]);

        $this->actingAs($usuario, 'web');

        return $usuario;
    }
}

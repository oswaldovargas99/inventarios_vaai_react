<?php

namespace Tests\Feature;

use App\Models\Administrador\Catalogos\Marca;
use App\Models\Administrador\Catalogos\Modelo;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ModeloApiTest extends TestCase
{
    use RefreshDatabase;

    private function autenticar(string $nombreRol = 'Administrador', bool $activo = true, bool $rolActivo = true): void
    {
        $rol = Rol::create(['nombre' => $nombreRol, 'activo' => $rolActivo]);
        $usuario = Usuario::create([
            'rol_id' => $rol->id, 'codigo' => 'MODELOS-01', 'nombre' => 'Prueba',
            'password' => 'password', 'activo' => $activo,
        ]);
        $this->actingAs($usuario, 'web');
    }

    private function modelo(): Modelo
    {
        $marca = Marca::create(['nombre' => 'Dell', 'estatus' => true]);

        return Modelo::create(['marca_id' => $marca->id, 'nombre' => 'Latitude', 'estatus' => true]);
    }

    public static function matriz(): array
    {
        $casos = [];
        foreach (['Administrador', 'Patrimonio', 'Secretario', 'Usuario'] as $rol) {
            foreach (['listar', 'consultar', 'crear', 'editar', 'cambiarEstatus', 'eliminar'] as $accion) {
                $permitido = in_array($accion, ['listar', 'consultar'], true)
                    || $rol === 'Administrador'
                    || ($rol === 'Patrimonio' && $accion !== 'eliminar');
                $casos["$rol $accion"] = [$rol, $accion, $permitido];
            }
        }

        return $casos;
    }

    #[DataProvider('matriz')]
    public function test_matriz_de_permisos(string $rol, string $accion, bool $permitido): void
    {
        $this->autenticar($rol);
        $modelo = $this->modelo();
        $ruta = "/api/modelos/{$modelo->id}";
        $datos = ['marca_id' => $modelo->marca_id, 'nombre' => 'Precision'];
        $respuesta = match ($accion) {
            'listar' => $this->getJson('/api/modelos'),
            'consultar' => $this->getJson($ruta),
            'crear' => $this->postJson('/api/modelos', $datos),
            'editar' => $this->putJson($ruta, $datos),
            'cambiarEstatus' => $this->patchJson("$ruta/estatus"),
            'eliminar' => $this->deleteJson($ruta),
        };
        $respuesta->assertStatus($permitido ? ($accion === 'crear' ? 201 : 200) : 403);
        if (! $permitido) {
            $this->assertDatabaseHas('vaai_cat_modelos', ['id' => $modelo->id, 'nombre' => 'Latitude', 'estatus' => true]);
            $this->assertDatabaseCount('vaai_cat_modelos', 1);
        } elseif ($accion === 'eliminar') {
            $this->assertDatabaseMissing('vaai_cat_modelos', ['id' => $modelo->id]);
        } elseif ($accion === 'cambiarEstatus') {
            $this->assertFalse($modelo->fresh()->estatus);
        } elseif (in_array($accion, ['crear', 'editar'], true)) {
            $this->assertDatabaseHas('vaai_cat_modelos', $datos);
        }
    }

    public function test_todas_las_operaciones_requieren_autenticacion(): void
    {
        $this->getJson('/api/modelos')->assertUnauthorized();
        $this->getJson('/api/modelos/1')->assertUnauthorized();
        $this->postJson('/api/modelos', [])->assertUnauthorized();
        $this->putJson('/api/modelos/1', [])->assertUnauthorized();
        $this->patchJson('/api/modelos/1/estatus')->assertUnauthorized();
        $this->deleteJson('/api/modelos/1')->assertUnauthorized();
    }

    public function test_usuario_inactivo_no_accede(): void
    {
        $this->autenticar(activo: false);
        $this->getJson('/api/modelos')->assertForbidden();
    }

    public function test_rol_inactivo_no_accede(): void
    {
        $this->autenticar(rolActivo: false);
        $this->getJson('/api/modelos')->assertForbidden();
    }

    public function test_rol_desconocido_no_accede(): void
    {
        $this->autenticar('Otro');
        $this->getJson('/api/modelos')->assertForbidden();
        $this->postJson('/api/modelos')->assertForbidden();
    }

    public function test_validacion_unicidad_por_marca_y_relacion(): void
    {
        $this->autenticar();
        $modelo = $this->modelo();
        $datos = ['marca_id' => $modelo->marca_id, 'nombre' => ' Latitude '];
        $this->postJson('/api/modelos', $datos)->assertUnprocessable()->assertJsonValidationErrors('nombre');
        $this->putJson("/api/modelos/{$modelo->id}", $datos)->assertOk();
        $otra = Marca::create(['nombre' => 'Otra', 'estatus' => true]);
        $this->postJson('/api/modelos', ['marca_id' => $otra->id, 'nombre' => 'Latitude'])
            ->assertCreated()->assertJsonPath('data.marca.nombre', 'Otra')->assertJsonPath('data.estatus', true);
        $this->postJson('/api/modelos', ['marca_id' => 999, 'nombre' => 'Nuevo'])
            ->assertUnprocessable()->assertJsonValidationErrors('marca_id');
        $this->postJson('/api/modelos', ['marca_id' => $otra->id, 'nombre' => [], 'descripcion' => str_repeat('x', 256), 'estatus' => 'mal'])
            ->assertUnprocessable()->assertJsonValidationErrors(['nombre', 'descripcion', 'estatus']);
        $this->getJson('/api/modelos/999')->assertNotFound();
    }

    public function test_marcas_inactivas_y_eliminacion_restringida(): void
    {
        $this->autenticar();
        $modelo = $this->modelo();
        $this->deleteJson("/api/marcas/{$modelo->marca_id}")->assertConflict();
        $this->assertDatabaseHas('vaai_cat_marcas', ['id' => $modelo->marca_id]);
        $modelo->marca->update(['estatus' => false]);
        $datos = ['marca_id' => $modelo->marca_id, 'nombre' => 'Nuevo'];
        $this->postJson('/api/modelos', $datos)->assertUnprocessable();
        $this->putJson("/api/modelos/{$modelo->id}", $datos)->assertUnprocessable();
        $this->patchJson("/api/modelos/{$modelo->id}/estatus")->assertOk()->assertJsonPath('data.estatus', false);
        $this->patchJson("/api/modelos/{$modelo->id}/estatus")->assertUnprocessable();
        $this->assertFalse($modelo->fresh()->estatus);
    }

    public function test_paginacion_busqueda_y_filtros_combinados(): void
    {
        $this->autenticar();
        $modelo = $this->modelo();
        foreach (range(1, 11) as $numero) {
            Modelo::create(['marca_id' => $modelo->marca_id, 'nombre' => "Modelo $numero", 'descripcion' => 'Portátil', 'estatus' => false]);
        }
        $this->getJson('/api/modelos')->assertOk()->assertJsonCount(10, 'data.data')->assertJsonPath('data.total', 12);
        $this->getJson('/api/modelos?page=2')->assertOk()->assertJsonCount(2, 'data.data');
        $this->getJson('/api/modelos?buscar=Latitude')->assertOk()->assertJsonCount(1, 'data.data');
        $this->getJson('/api/modelos?buscar='.urlencode('Portátil'))->assertOk()->assertJsonPath('data.total', 11);
        $this->getJson("/api/modelos?buscar=Dell&marca_id={$modelo->marca_id}&estatus=0&per_page=2")
            ->assertOk()->assertJsonCount(2, 'data.data')->assertJsonPath('data.total', 11);
        $this->getJson('/api/modelos?estatus=')->assertOk()->assertJsonPath('data.total', 12);
        foreach (['per_page=0', 'per_page=-1', 'per_page=101', 'page=0', 'buscar[]=x', 'marca_id[]=1', 'estatus=incorrecto'] as $consulta) {
            $this->getJson("/api/modelos?$consulta")->assertUnprocessable();
        }
    }

    public function test_marcas_rechaza_arrays_y_busca_cero(): void
    {
        $this->autenticar();
        $marca = Marca::create(['nombre' => '0', 'estatus' => true]);
        Marca::create(['nombre' => 'Otra', 'estatus' => true]);
        $this->getJson('/api/marcas?buscar=0')->assertOk()->assertJsonCount(1, 'data.data');
        $this->getJson('/api/marcas?buscar[]=x')->assertUnprocessable();
        $this->postJson('/api/marcas', ['nombre' => ['x']])->assertUnprocessable();
        $this->putJson("/api/marcas/{$marca->id}", ['nombre' => ['x']])->assertUnprocessable();
    }
}

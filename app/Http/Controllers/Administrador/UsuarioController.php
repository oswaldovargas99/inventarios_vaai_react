<?php

namespace App\Http\Controllers\Administrador;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));

        $usuarios = Usuario::with('rol')
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->where(function ($consulta) use ($buscar) {
                    $consulta
                        ->where('codigo', 'like', '%'.$buscar.'%')
                        ->orWhere('nombre', 'like', '%'.$buscar.'%')
                        ->orWhere('apellido_paterno', 'like', '%'.$buscar.'%')
                        ->orWhere('apellido_materno', 'like', '%'.$buscar.'%')
                        ->orWhere('email', 'like', '%'.$buscar.'%');
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => $usuarios,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $request->validate([
            'codigo' => ['required', 'string', 'max:20', Rule::unique('vaai_usuarios', 'codigo')],
            'nombre' => ['required', 'string', 'max:100'],
            'apellido_paterno' => ['nullable', 'string', 'max:100'],
            'apellido_materno' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('vaai_usuarios', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'rol_id' => ['required', 'integer', Rule::in([1, 2, 3, 4]), Rule::exists('vaai_roles', 'id')],
            'id_centro_universitario' => ['nullable', 'integer', Rule::exists('vaai_centros_universitarios', 'id')],
        ], $this->mensajesValidacion());

        $usuario = Usuario::create([
            'codigo' => trim($validado['codigo']),
            'nombre' => trim($validado['nombre']),
            'apellido_paterno' => trim((string) ($validado['apellido_paterno'] ?? '')) ?: null,
            'apellido_materno' => trim((string) ($validado['apellido_materno'] ?? '')) ?: null,
            'email' => trim($validado['email']),
            'password' => $validado['password'],
            'rol_id' => $validado['rol_id'],
            'activo' => true,
            'id_centro_universitario' => $validado['id_centro_universitario'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado correctamente.',
            'data' => $usuario->load('rol'),
        ], 201);
    }

    public function update(Request $request, Usuario $usuario): JsonResponse
    {
        $validado = $request->validate([
            'codigo' => ['required', 'string', 'max:20', Rule::unique('vaai_usuarios', 'codigo')->ignore($usuario->id)],
            'nombre' => ['required', 'string', 'max:100'],
            'apellido_paterno' => ['nullable', 'string', 'max:100'],
            'apellido_materno' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('vaai_usuarios', 'email')->ignore($usuario->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'rol_id' => ['required', 'integer', Rule::in([1, 2, 3, 4]), Rule::exists('vaai_roles', 'id')],
            'activo' => ['required', 'boolean'],
            'id_centro_universitario' => ['nullable', 'integer', Rule::exists('vaai_centros_universitarios', 'id')],
        ], $this->mensajesValidacion());

        $datos = [
            'codigo' => trim($validado['codigo']),
            'nombre' => trim($validado['nombre']),
            'apellido_paterno' => trim((string) ($validado['apellido_paterno'] ?? '')) ?: null,
            'apellido_materno' => trim((string) ($validado['apellido_materno'] ?? '')) ?: null,
            'email' => trim($validado['email']),
            'rol_id' => $validado['rol_id'],
            'activo' => $validado['activo'],
            'id_centro_universitario' => $validado['id_centro_universitario'] ?? null,
        ];

        if (!empty($validado['password'])) {
            $datos['password'] = $validado['password'];
        }

        $usuario->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente.',
            'data' => $usuario->fresh()->load('rol'),
        ]);
    }

    public function destroy(Request $request, Usuario $usuario): JsonResponse
    {
        if ($request->user()->is($usuario)) {
            return response()->json([
                'message' => 'No puedes eliminar el usuario con el que has iniciado sesión.',
            ], 422);
        }

        $usuario->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }

    private function mensajesValidacion(): array
    {
        return [
            'codigo.required' => 'El código es obligatorio.',
            'codigo.unique' => 'El código ya está registrado.',
            'nombre.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'rol_id.required' => 'El rol es obligatorio.',
            'rol_id.exists' => 'Selecciona un rol válido.',
            'rol_id.in' => 'Selecciona un rol válido.',
            'activo.required' => 'El estatus es obligatorio.',
            'activo.boolean' => 'Selecciona un estatus válido.',
        ];
    }
}

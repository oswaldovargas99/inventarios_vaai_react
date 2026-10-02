# CONTEXTO DE ARQUITECTURA — Sistema de Inventarios VAAI

> Documento de referencia para entender la arquitectura del proyecto y poder
> generar nuevas vistas/módulos siguiendo las convenciones existentes.

## 1. Stack tecnológico

| Capa                | Tecnología                                    |
| ------------------- | --------------------------------------------- |
| Backend             | Laravel 12 (PHP 8.2+)                         |
| Frontend            | React 19 + Vite 6                             |
| Cliente HTTP        | Axios                                         |
| Enrutamiento SPA    | React Router DOM v7                           |
| UI                  | CoreUI 5 (`@coreui/react`), Bootstrap 5, CSS propio |
| Estilos adicionales | Tailwind 4 (solo en `resources/css/app.css`), SASS (`resources/scss/style.scss`) |
| Base de datos       | MySQL / MariaDB (XAMPP: `db_inventario_vaai`) |
| Autenticación       | Laravel Sanctum (SPA, cookies + CSRF)         |
| API                 | REST / JSON                                   |
| ORM                 | Eloquent                                      |
| Icons               | `@coreui/icons` + `@coreui/icons-react`       |

Roles del sistema: `Administrador`, `Patrimonio`, `Secretario`, `Usuario`.

## 2. Estructura de directorios

```
inventarios_vaai/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php                 # login / usuario / logout
│   │   │   ├── Controller.php
│   │   │   └── Administrador/                     # Módulos de administración
│   │   │       ├── Catalogos/                     # CATÁLOGOS -> controllers
│   │   │       │   ├── TipoEquipoController.php
│   │   │       │   ├── MarcaController.php
│   │   │       │   ├── ModeloController.php
│   │   │       │   └── CentroUniversitarioController.php
│   │   │       ├── ProveedorController.php        # PSR-4: el nombre del archivo DEBE = nombre de la clase
│   │   │       ├── DependenciaController.php
│   │   │       ├── EquipoController.php
│   │   │       ├── TrasladoController.php
│   │   │       └── UsuarioController.php
│   │   └── Middleware/
│   │       ├── RolMiddleware.php                  # alias "rol:Administrador,Patrimonio,..."
│   │       └── UsuarioRolActivoMiddleware.php     # alias "usuario.rol.activo"
│   └── Models/
│       ├── Rol.php, Usuario.php, Proveedor.php, CentroUniversitario.php
│       └── Administrador/
│           ├── Dependencia.php, Equipo.php, Traslado.php
│           └── Catalogos/
│               ├── TipoEquipo.php, Marca.php, Modelo.php
├── bootstrap/app.php                              # registro de middlewares + statefulApi()
├── routes/
│   ├── web.php                                    # SPA: sirve la vista app (catch-all)
│   └── api.php                                    # TODAS las rutas API van aquí
├── config/
│   ├── cors.php                                   # origenes Vite 5173 + credentials
│   └── sanctum.php
├── database/
│   ├── migrations/                                # tablas con prefijo vaai_
│   └── seeders/                                   # RolSeeder, UsuarioSeeder, catálogos, etc.
├── resources/
│   ├── views/app.blade.php                        # contenedor #app + @vite
│   ├── css/app.css                                # Tailwind
│   ├── css/catalogos.css                          # estilos de tablas/badges de catálogos
│   ├── scss/style.scss                            # CoreUI
│   └── js/
│       ├── app.jsx                                # ENTRADA React (monta <AuthProvider><RouterApp/>)
│       ├── bootstrap.js
│       ├── RouterApp.jsx                          # TODAS las rutas SPA
│       ├── auth/permisos.js                       # matriz de permisos por rol/catálogo (FRONTEND)
│       ├── contexts/AuthContext.jsx               # sesión, login/logout, refreshUser
│       ├── hooks/useAuth.js, usePermisos.js
│       ├── services/                              # clientes API por módulo
│       │   └── authService.js, equipoService.js, dependencias.js, ...
│       ├── coreui/_nav.jsx                        # menú lateral (Catálogos, Equipos, Proveedores...)
│       ├── components/                            # AppSidebar, ProtectedRoute, CatalogPresentation...
│       └── pages/                                 # UNA carpeta por módulo (dashboard, catalogos, equipos, proveedores...)
├── tests/
│   ├── Feature/                                   # pruebas HTTP/API por módulo
│   └── Unit/
├── docs/                                          # documentación del proyecto
└── TEMPLATE/                                      # plantilla CoreUI (NO es código de producción)
```

## 3. Cómo fluye una petición (ciclo de vida)

1. **Carga inicial (SPA).** `routes/web.php` captura cualquier ruta (`/{any?}`)
   y devuelve `resources/views/app.blade.php`, que contiene `<div id="app">` y
   `@vite(['resources/css/app.css', 'resources/js/app.jsx'])`.
2. **React monta** `app.jsx` → `AuthProvider` → `RouterApp.jsx`.
   `AuthProvider` consulta `GET /api/user` para restaurar la sesión
   (`obtenerUsuario()` en `services/authService.js`).
3. **Autenticación de la API (Sanctum SPA).** Antes de "mutaciones"
   (POST/PUT/PATCH/DELETE), el frontend pide `GET /sanctum/csrf-cookie` y las
   peticiones viajan con `withCredentials: true` y la cabecera XSRF-TOKEN
   (`axios.create({ withCredentials: true, withXSRFToken: true })`).
4. **Chain de middleware en `routes/api.php`:**
   `auth:sanctum` → `usuario.rol.activo` → `rol:Administrador,Patrimonio,...` → Controlador.
5. **Controlador:** valida con `$request->validate(...)`, opera con Eloquent y
   devuelve `response()->json([...])`.
6. **Frontend consume** a través de un servicio de `resources/js/services/`
   y muestra la vista.

## 4. Backend — convenciones y patrones

### 4.1 Rutas API (`routes/api.php`)

- Todas las rutas viven en `routes/api.php` y llevan el prefijo automático `/api`.
- **Públicas:** solo `POST /login`.
- **Protegidas:** se anidan dentro de:
  ```php
  Route::middleware('auth:sanctum')->group(function () {
      Route::post('/logout', ...);

      Route::middleware('usuario.rol.activo')->group(function () {
          // ... aquí van los recursos
      });
  });
  ```
- **Patrón de recurso de catálogo** (mismos permisos para todos los catálogos):
  ```php
  Route::prefix('marcas')->group(function () {
      // Lectura: cualquiera autenticado con rol activo
      Route::get('/', [MarcaController::class, 'index'])
          ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');
      Route::get('/{marca}', [MarcaController::class, 'show'])
          ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');
      // Escritura: Administrador y Patrimonio
      Route::post('/', [MarcaController::class, 'store'])
          ->middleware('rol:Administrador,Patrimonio');
      Route::put('/{marca}', [MarcaController::class, 'update'])
          ->middleware('rol:Administrador,Patrimonio');
      Route::patch('/{marca}/estatus', [MarcaController::class, 'cambiarEstatus'])
          ->middleware('rol:Administrador,Patrimonio');
      // Eliminación: solo Administrador
      Route::delete('/{marca}', [MarcaController::class, 'destroy'])
          ->middleware('rol:Administrador');
  });
  ```
  > Endpoints de estatus usan `PATCH /{recurso}/estatus`. Si el campo de estado
  > se llama `activo` (p. ej. proveedores), el body lleva `{"activo": bool}`;
  > si se llama `estatus` (p. ej. marcas), el endpoint invierte el valor sin body.

### 4.2 Endpoints actuales

| Método | URI | Rol mínimo | Controlador → método |
| ------ | --- | ---------- | -------------------- |
| POST | `/api/login` | público | `AuthController@login` |
| POST | `/api/logout` | sesión | `AuthController@logout` |
| GET | `/api/user` | sesión activa | `AuthController@usuario` |
| GET/POST | `/api/tipos-equipo` | leer: todos / crear: Admin,Patrimonio | `TipoEquipoController@index/store` |
| GET/PUT/PATCH/DELETE | `/api/tipos-equipo/{id}(/estatus)` | editar: Admin,Patrimonio / borrar: Admin | `TipoEquipoController@...` |
| GET/POST | `/api/marcas` | igual catálogo | `MarcaController@index/store` |
| GET/POST | `/api/modelos` | igual catálogo | `ModeloController@index/store` |
| GET/POST | `/api/proveedores` | igual catálogo | `ProveedorController@index/store` |
| GET | `/api/equipos`, `/api/equipos/traslados`, `/api/equipos/{id}` | todos | `EquipoController` / `TrasladoController` |
| POST | `/api/equipos` | Admin,Patrimonio | `EquipoController@store` |
| GET/POST | `/api/dependencias`, `/paises`, `/entidades-federativas`, `/codigo-postal/{cp}` | leer: todos / resto: Admin,Patrimonio | `DependenciaController@...` |
| GET | `/api/centros-universitarios` | todos | `CentroUniversitarioController@index` |
| GET/POST/PATCH/DELETE | `/api/usuarios` | crear/editar: Admin,Patrimonio / borrar: Admin | `UsuarioController@...` |

### 4.3 Controladores

- **Ubicación:** `app/Http/Controllers/Administrador/...`
  - Catálogos puros → `Administrador/Catalogos/*`.
  - Módulos (proveedores, dependencias, equipos, usuarios, traslados) → `Administrador/*`.
- **PSR-4 obligatorio:** el archivo debe llamarse exactamente igual que la clase
  (clase `ProveedorController` → `ProveedorController.php`).
- Métodos estándar: `index`, `store`, `show`, `update`, `destroy`,
  `cambiarEstatus` (+ métodos propios del dominio).
- **Validación:** `$request->validate([...], ["campo.regla" => "mensaje en español"])`.
  Nombre único: `'unique:vaai_tabla,campo'`; en update
  `Rule::unique('vaai_tabla', 'campo')->ignore($modelo->id)`.
- **Respuestas JSON estándar:**
  - Listados paginados: `['success' => true, 'data' => $paginator]`.
  - Lectura simple: `['success' => true, 'data' => $modelo]`.
  - Creación (201): `['success' => true, 'message' => '...', 'data' => $modelo]`.
  - Actualización: igual con `$modelo->fresh()` en `data`.
  - Inactivar/eliminar: `['success' => true, 'message' => '...']`.
- Buscar en `index`: parámetro `buscar` con `->when(...)` + `LIKE`, y
  `->paginate(10)->withQueryString()`.

### 4.4 Modelos Eloquent

- **Ubicación:** `app/Models/` (raíz: `Rol`, `Usuario`, `Proveedor`,
  `CentroUniversitario`) o `app/Models/Administrador/...` siguiendo la misma
  jerarquía que los controladores.
- Patrón mínimo:
  ```php
  class Marca extends Model {
      use HasFactory;

      protected $table  = 'vaai_cat_marcas';
      protected $fillable = ['nombre', 'estatus'];
      protected $casts   = ['estatus' => 'boolean'];
  }
  ```
- Relaciones con `BelongsTo`/`HasMany` (ver `Usuario::rol()`).
- El `$table` del modelo debe coincidir con la tabla que crea la migración
  y que usa el controlador (`Proveedor.php` → `vaai_proveedores`).

### 4.5 Migraciones y base de datos

- **Ubicación:** `database/migrations/` y `database/seeders/`.
- **Regla de oro:** TODAS las tablas del dominio llevan prefijo `vaai_`
  (`vaai_usuarios`, `vaai_roles`, `vaai_cat_marcas`, `vaai_proveedores`, ...).
- **No modifiques/renombres una migración ya ejecutada** (rompe el historial de
  la tabla `migrations`); para cambios crea una NUEVA migración.
- Columnas habituales: `$table->id()`, `$table->string('nombre', 100)`,
  booleans `estatus` o `activo` con `->default(true)`, claves foráneas
  `$table->foreignId('rol_id')->constrained('vaai_roles')->cascadeOnUpdate()->restrictOnDelete()`,
  `$table->timestamps()`.
- Estados en el dominio: catálogos usan `estatus` (bool) o `activo` (bool,
  proveedores); dependencias usa `estatus` string
  ('activo'/'inactivo'/'pendiente') y `vigente` (bool).
- Comandos: `php artisan migrate`, `php artisan migrate:status`,
  `php artisan migrate --seed`, `php artisan db:table vaai_<tabla>`.
- Archivos de archivos subidos (p. ej. constancia SAT de proveedores): disco
  `public` + `php artisan storage:link`.
- Seeders: `database/seeders/` (con subcarpetas `Administrador/Catalogos/`);
  se registran en `DatabaseSeeder.php`. `RolSeeder` crea los 4 roles.

## 5. Frontend — convenciones y patrones

### 5.1 Punto de entrada y enrutador

- `resources/js/app.jsx`: monta `<AuthProvider><RouterApp /></AuthProvider>` en `#app`.
- `resources/js/RouterApp.jsx`: define TODAS las rutas SPA. Cada ruta se protege
  con `<ProtectedRoute catalogo="..." permiso="...">`. Ejemplo real:
  ```jsx
  import Proveedores  from './pages/proveedores/Proveedores';
  import AltaProveedor from './pages/proveedores/AltaProveedor';

  <Route
      path="/proveedores/alta"
      element={
          <ProtectedRoute catalogo="proveedores" permiso="crear">
              <AltaProveedor />
          </ProtectedRoute>
      }
  />
  ```
- ⚠️ Todo componente usado en RouterApp DEBE estar importado; si se usa sin
  import → `ReferenceError` al renderizar → **pantalla blanca en toda la app**
  (el build de Vite no detecta ese error).
- Nombres de archivos y de componentes en `PascalCase`, y el `import` debe
  escribir EXACTAMENTE el mismo nombre (mayúsculas incluidas); Windows tolera
  diferencias de mayúsculas, Linux no.

### 5.2 Capa de presentación

- `layouts/DefaultLayout.jsx` → `AppSidebar` + `AppHeader` + `AppContent`
  (`<Outlet />`) + `AppFooter`.
- `components/ProtectedRoute.jsx`:
  - Muestra "Verificando sesión..." mientras `cargandoInicial`.
  - Redirige a `/login` sin sesión.
  - Muestra `AccesoDenegado` si no cumple `catalogo` + `permiso`.
- Menú lateral: `coreui/_nav.jsx`. Cada item lleva metadatos
  `{ component, name, to, catalogo, permiso }`; `AppSidebar.jsx` los filtra
  automáticamente con `tienePermiso()`.
   ```jsx
   { component: CNavItem, name: 'Alta proveedor',
     to: '/proveedores/alta', catalogo: 'proveedores', permiso: 'crear' }
   ```

### 5.3 Permisos (frontend)

- Matriz por catálogo en `resources/js/auth/permisos.js`:
  ```js
  export const matrizPermisos = {
      tiposEquipo: permisosPorRol,
      proveedores: permisosPorRol,   // <-- si tu módulo no está, agrégalo
      ...
  };
  ```
  `permisosPorRol` = Administrador (todo + eliminar), Patrimonio
  (leer+crear+editar+cambiarEstatus), Secretario y Usuario (solo lectura).
- Hook `usePermisos('catalogo')` → `{ listar, consultar, crear, editar,
  cambiarEstatus, eliminar }`.
- ⚠️ Los permisos del frontend SOLO ocultan la UI; la autorización real la
  aplica el middleware `rol:` en el backend.

### 5.4 Servicios API (`resources/js/services/*.js`)

- Cada módulo tiene un archivo con funciones `listarX`, `crearX`,
  `actualizarX`, `cambiarEstatusX`, `eliminarX`.
- Axios con credenciales y CSRF:
  ```js
  import axios from 'axios';
  const api = axios.create({ withCredentials: true, withXSRFToken: true });

  export async function listarProveedores(params = {}, signal) {
      const { data } = await api.get('/api/proveedores', { params, signal });
      return data;
  }

  export async function crearProveedor(formulario) {
      await api.get('/sanctum/csrf-cookie');
      const { data } = await api.post('/api/proveedores', formulario);
      return data;
  }
  ```
- File upload: si hay un `File`, hay que enviarlo como `FormData` (ver
  `proveedorService.js`, función `prepararFormulario`).
- Lecturas reciben un `signal` (AbortController) y consultas `params`
  (`{ buscar, page }`).

### 5.5 Patrón de página de LISTADO

Reutilizar los componentes de `components/catalogos/CatalogPresentation.jsx`
(`CatalogHeader`, `StatusBadge`, `CatalogLoading`, `CatalogEmptyState`) y las
tablas/paginación de CoreUI. El esqueleto del módulo proveedores sirve de
referencia (`resources/js/pages/proveedores/Proveedores.jsx`):

```jsx
const [listado, setListado] = useState({ data: [], total: 0, last_page: 1, current_page: 1 });
const [busqueda, setBusqueda] = useState('');
const [pagina, setPagina] = useState(1);
const [recarga, setRecarga] = useState(0);

const cargar = (signal) => {
    setCargando(true);
    listarProveedores({ buscar: busqueda || undefined, page: pagina }, signal)
        .then((respuesta) => { if (!signal.aborted) setListado(respuesta.data); })
        .catch((error) => {
            if (!signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: 'No fue posible cargar los proveedores.' });
            }
        })
        .finally(() => { if (!signal.aborted) setCargando(false); });
};

useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => cargar(controller.signal), 250); // debounce de búsqueda
    return () => { window.clearTimeout(timer); controller.abort(); };
}, [busqueda, pagina, recarga]);
```

- Estructura JSX: `CRow > CCol > CCard > CatalogHeader(con botón "Registrar") >
  CCardBody > (CAlert) + CInputGroup(búsqueda) + [CatalogLoading | CatalogEmptyState | CTable + CPagination]`.
- `respuesta.data` es el paginador de Laravel (`{ data, total, last_page, current_page }`).
- Acciones por fila (editar / activar-desactivar / eliminar) se muestran según
  `permisos.*` y abren `CModal` de confirmación (`cambiarEstatusX`, `eliminarX`).
- Errores de sesión se delegan con `manejarError.current(error)` (hook `useAuth`).

### 5.6 Patrón de página de FORMULARIO (Alta/Edición)

`resources/js/pages/proveedores/AltaProveedor.jsx` es el modelo:
- `usePermisos('proveedores')` + `useAuth()`, manejo de `formulario`, `errores`,
  `guardando`, `mensaje`.
- `CForm onSubmit={guardar}`; campos `CFormInput`/`CFormSelect`/`CFormTextarea`
  con `invalid={Boolean(errorDe('campo'))}` + `<div className="invalid-feedback d-block">`.
- Validación local antes de llamar al servicio y `crearProveedor(formulario)` en
  el `try`, mostrando `respuesta.message` en un `CAlert` success.
- Errores de validación del backend → `setErrores(error.response?.data?.errors ?? {})`.
- Si el módulo es solo un modal de edición/creación dentro del listado, ver el
  patrón de `Proveedores.jsx` (CModal con formulario).

## 6. Paso a paso: crear un módulo nuevo (p. ej. "MiCrud")

Usa `proveedores` como ejemplo implementado del inicio a fin.

### Paso 0 — Decidir si hace falta migración
- Si la tabla ya existe (revisa `database/migrations` y `php artisan db:table`,
  o `php artisan migrate:status`), NO la crees.
- Si no existe, crea la migración.
- Nunca modifiques una migración ya ejecutada.

### Paso 1 — Migración (solo si hace falta)
Archivo: `database/migrations/<fecha>_create_vaai_mi_cruds_table.php`

```php
return new class extends Migration {
    public function up(): void {
        Schema::create('vaai_mi_cruds', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('vaai_mi_cruds');
    }
};
```
Ejecuta: `php artisan migrate`.

### Paso 2 — Modelo Eloquent
Archivo: `app/Models/Administrador/MiCrud.php` (así se agrupan los módulos)

```php
class MiCrud extends Model {
    use HasFactory;

    protected $table = 'vaai_mi_cruds';

    protected $fillable = ['nombre', 'activo'];

    protected $casts = ['activo' => 'boolean'];
}
```

### Paso 3 — Controlador
Archivo: `app/Http/Controllers/Administrador/MiCrudController.php`
⚠️ el archivo debe llamarse EXACTAMENTE como la clase.

```php
class MiCrudController extends Controller {
    public function index(Request $request): JsonResponse
    {
        $buscar = trim((string) $request->query('buscar', ''));
        $items = MiCrud::when($buscar !== '', function ($q) use ($buscar) {
                $q->where('nombre', 'like', '%'.$buscar.'%');
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
        ], ['nombre.required' => 'El nombre es obligatorio.']);

        $item = MiCrud::create(['nombre' => trim($validado['nombre']), 'activo' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Registro creado correctamente.',
            'data' => $item,
        ], 201);
    }

    // show, update, destroy y cambiarEstatus siguiendo MarcaController/ProveedorController
}
```

### Paso 4 — Rutas API
Archivo: `routes/api.php` (dentro de `auth:sanctum` → `usuario.rol.activo`),
al final del grupo y con su comentario de cabecera:

```php
Route::prefix('mi-cruds')->group(function () {
    Route::get('/', [MiCrudController::class, 'index'])
        ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');
    Route::get('/{miCrud}', [MiCrudController::class, 'show'])
        ->middleware('rol:Administrador,Patrimonio,Secretario,Usuario');
    Route::post('/', [MiCrudController::class, 'store'])
        ->middleware('rol:Administrador,Patrimonio');
    Route::put('/{miCrud}', [MiCrudController::class, 'update'])
        ->middleware('rol:Administrador,Patrimonio');
    Route::patch('/{miCrud}/estatus', [MiCrudController::class, 'cambiarEstatus'])
        ->middleware('rol:Administrador,Patrimonio');
    Route::delete('/{miCrud}', [MiCrudController::class, 'destroy'])
        ->middleware('rol:Administrador');
});
```
Añade también el `use App\Http\Controllers\Administrador\MiCrudController;` arriba.
Verifica: `php artisan route:list --path=mi-cruds`.

### Paso 5 — Servicio JS
Archivo: `resources/js/services/miCrudService.js`

```js
import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export async function listarMiCruds(params = {}, signal) {
    const { data } = await api.get('/api/mi-cruds', { params, signal });
    return data;
}

export async function crearMiCrud(formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post('/api/mi-cruds', formulario);
    return data;
}

export async function actualizarMiCrud(id, formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.put(`/api/mi-cruds/${id}`, formulario);
    return data;
}

export async function cambiarEstatusMiCrud(id, activo) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.patch(`/api/mi-cruds/${id}/estatus`, { activo });
    return data;
}

export async function eliminarMiCrud(id) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.delete(`/api/mi-cruds/${id}`);
    return data;
}
```
> Si el backend usa `estatus` (bool sin body), y no `activo`, elimina el `{ activo }` del PATCH.

### Paso 6 — Página de listado
Archivo: `resources/js/pages/miCruds/MiCruds.jsx`
Copia el esqueleto de `resources/js/pages/proveedores/Proveedores.jsx`
(listado + búsqueda + paginación + modal edición + confirmaciones) y sustituye
el nombre del servicio/estado. El componente se llama como el archivo y se
exporta por defecto (`export default MiCruds;`).

### Paso 7 — Página de alta (vista nueva)
Archivo: `resources/js/pages/miCruds/AltaMiCrud.jsx`
Copia el formulario de `resources/js/pages/proveedores/AltaProveedor.jsx`:
- `function AltaMiCrud()` + `usePermisos('miCruds')` + `useNavigate()`.
- `CForm` con los campos, validación local y `crearMiCrud(formulario)`.
- Botón "Volver al listado" con `navigate('/mi-cruds')`.

### Paso 8 — Registrar rutas SPA
Archivo: `resources/js/RouterApp.jsx`
- Importa las páginas:
  ```jsx
  import MiCruds    from './pages/miCruds/MiCruds';
  import AltaMiCrud from './pages/miCruds/AltaMiCrud';
  ```
- Dentro del `<Route element={<ProtectedRoute><DefaultLayout/></ProtectedRoute>}>`:
  ```jsx
  <Route path="/mi-cruds" element={
      <ProtectedRoute catalogo="miCruds" permiso="listar"><MiCruds /></ProtectedRoute>
  } />
  <Route path="/mi-cruds/alta" element={
      <ProtectedRoute catalogo="miCruds" permiso="crear"><AltaMiCrud /></ProtectedRoute>
  } />
  ```
- IMPORTANTE: no uses un componente sin importarlo (pantalla blanca).

### Paso 9 — Menú lateral
Archivo: `resources/js/coreui/_nav.jsx` — añade un `CNavGroup`/`CNavItem`:
```jsx
{
    component: CNavItem,
    name: 'Mi Crud',
    to: '/mi-cruds',
    catalogo: 'miCruds',
    permiso: 'listar',
}
```

### Paso 10 — Permisos frontend
Archivo: `resources/js/auth/permisos.js` — añade el catálogo a `matrizPermisos`:
```js
export const matrizPermisos = {
    ...,           // catálogos existentes
    miCruds: permisosPorRol,
};
```

### Paso 11 — Seeder (opcional)
Archivo: `database/seeders/...` + registro en `DatabaseSeeder.php`,
usando `updateOrCreate` (ver `RolSeeder.php`).

### Paso 12 — Tests
Archivo: `tests/Feature/MiCrudApiTest.php` (modelo: `MarcaCatalogoTest.php`).
- Usa `RefreshDatabase`, `$this->actingAs($usuario, 'web')` con un rol creado.
- Prueba: roles permitidos listan/no crean; Admin crea/edita/cambia estatus/
  elimina; validaciones (`assertUnprocessable`, `assertJsonValidationErrors`).

### Paso 13 — Validación final
```bash
php artisan route:list --path=mi-cruds   # rutas registradas
php artisan test                         # suite completa
npm run build                            # compila el frontend (SPA)
./vendor/bin/pint                        # formateo de código PHP (si aplica)
```
> Si `php` no está en el PATH de tu shell, usa la ruta de XAMPP:
> `c:\xampp\php\php.exe artisan ...`

## 7. Base de datos actual (tablas principales)

- `users`, `cache`, `jobs`, `personal_access_tokens` (framework).
- `vaai_roles` (4 roles), `vaai_usuarios` (usuario + `rol_id` FK).
- `vaai_cat_tipos_equipo`, `vaai_cat_marcas`, `vaai_cat_modelos`
  (catálogos con `estatus` bool).
- `vaai_dependencias`, `vaai_proveedores`, `vaai_ubicaciones`,
  `vaai_centros_universitarios`.
- `vaai_equipos` (+ `estatus`/`observaciones`), `vaai_traslados`.
- `postal_codes` (catálogo SEPOMEX cargado por seeder).
- Planificadas (docs): `vaai_estados_equipo`, `vaai_asignaciones`,
  `vaai_movimientos`, `vaai_mantenimientos`, `vaai_bajas`.

## 8. Comandos rápidos

| Tarea | Comando |
| ----- | ------- |
| Instalar backend | `composer install` |
| Instalar frontend | `npm install` |
| Levantar todo | `composer dev` (Laravel + Vite + colas + logs) |
| Vite solo | `npm run dev` |
| Build producción | `npm run build` |
| Migrar + sembrar | `php artisan migrate --seed` |
| Rutas API | `php artisan route:list --path=api` |
| Pruebas | `php artisan test` |
| Formateo PHP | `./vendor/bin/pint` |
| Enlazar storage | `php artisan storage:link` |
| PHP via XAMPP | `c:\xampp\php\php.exe <artisan/otro>` |

## 9. Errores y trampas conocidas en este proyecto

1. **Pantalla blanca en toda la app:** un componente usado en `RouterApp.jsx`
   sin `import` (`ReferenceError` en runtime). El build de Vite NO lo detecta.
2. **`Class "X" not found` en `/api/...`:** el nombre del archivo del controlador
   no coincide con la clase (PSR-4). Sufrió el módulo de proveedores
   (`ProveedoresController.php` vs clase `ProveedorController`).
3. **Import casa-de-diferencias:** `import AltaProveedor from './pages/proveedores/AltaProveedor'`
   no debe depender de mayúsculas/minúsculas del sistema de archivos.
   En Windows funciona, en Linux no. El archivo y el import deben coincidir.
4. **No renombrar migraciones ya ejecutadas:** rompe `migrate:status/rollback`.
   Tabla de proveedores = migración `2026_09_23_213546_create_proveedors_table.php`
   (nombre con typo, pero la tabla `vaai_proveedores` está creada y APLICADA;
   no renombrar).
5. **Menú "Proveedores" sin página → nav enlaza a rutas SPA** que deben existir
   en `RouterApp.jsx`; la página `Proveedores.jsx` estaba vacía (0 bytes).
6. **`intl` de PHP no instalado:** `php artisan db:table` y algún formateo
   numérico lanzan `RuntimeException` por la extensión `intl`. No afecta tests
   ni rutas.
7. **No crear backups tipo `Login copy.jsx` / `Page copy.jsx`** (regla del repo).
   Existen copias viejas de `Login`/`TiposEquipo`/`Marcas` que no se usan.
8. **CRLF/LF:** los archivos mostrados con `\r\n` pueden avisar de
   "CRLF will be replaced by LF" en git; es funcionamiento normal.

## 10. Convenciones de código y flujo de trabajo

- PHP: 4 espacios, PSR-12, `./vendor/bin/pint`. JS: 4 espacios, puntos y comas.
- Nombres: `PascalCase` clases/componentes, `camelCase` métodos/variables,
  nombres de dominio en español (`TipoEquipo`, `cambiarEstatus`,
  `AltaProveedor`).
- Tablas con prefijo `vaai_`; catálogos con `vaai_cat_*`.
- Antes de implementar: revisa el módulo similar existente y reutiliza
  componentes (`CatalogPresentation`, `ProtectedRoute`, `CentroUniversitarioSelector`).
- No elimines código sin registrar el porqué.
- Reporta archivos modificados al final + corre `php artisan test`, `npm run build`
  y `php artisan route:list`.
- Commits: imperativo corto en español (p. ej. `catalogos: valida nombres de marcas`).
- PRs: comportamiento, impacto en BD, evidencia de tests, issues ligados,
  screenshots.

---

*Nota: este documento describe el estado actual del repositorio
(React + Vite + Laravel 12 + Sanctum). Se actualiza conforme crezcan los módulos.*
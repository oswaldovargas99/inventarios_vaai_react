const acciones = Object.freeze([
    'listar',
    'consultar',
    'crear',
    'editar',
    'cambiarEstatus',
    'eliminar',
]);

const permisosLectura = Object.freeze({
    listar: true,
    consultar: true,
    crear: false,
    editar: false,
    cambiarEstatus: false,
    eliminar: false,
});

const permisosGestion = Object.freeze({
    ...permisosLectura,
    crear: true,
    editar: true,
    cambiarEstatus: true,
});

const permisosPorRol = Object.freeze({
    Administrador: Object.freeze({
        ...permisosGestion,
        eliminar: true,
    }),

    Patrimonio: permisosGestion,

    Secretario: permisosLectura,

    Usuario: permisosLectura,
});

export const matrizPermisos = Object.freeze({
    tiposEquipo: permisosPorRol,
    marcas: permisosPorRol,
    modelos: permisosPorRol,
    equipos: permisosPorRol,
    proveedores: permisosPorRol,
    cotizaciones: permisosPorRol, // <--- Integrado para el nuevo módulo
    dependencias: permisosPorRol,
    usuarios: permisosPorRol,
});

export function tienePermiso(
    usuario,
    catalogo,
    permiso
) {
    /*
    |--------------------------------------------------------------------------
    | Validar usuario y rol activos
    |--------------------------------------------------------------------------
    */

    if (
        !usuario
        || usuario.activo === false
        || usuario.rol?.activo === false
    ) {
        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | Obtener rol del usuario
    |--------------------------------------------------------------------------
    */

    const nombresRoles = {
        1: 'Administrador',
        2: 'Patrimonio',
        3: 'Secretario',
        4: 'Usuario',
    };

    const rol = usuario.rol?.nombre 
        || (typeof usuario.rol === 'string' ? usuario.rol : null)
        || nombresRoles[usuario.rol_id]
        || nombresRoles[usuario.rol?.id];

    /*
    |--------------------------------------------------------------------------
    | Validar catálogo, rol y permiso
    |--------------------------------------------------------------------------
    */

    if (
        !Object.hasOwn(matrizPermisos, catalogo)
        || !Object.hasOwn(permisosPorRol, rol)
        || !acciones.includes(permiso)
    ) {
        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | Comprobar permiso
    |--------------------------------------------------------------------------
    */

    return matrizPermisos[catalogo][rol][permiso] === true;
}

export function obtenerPermisos(
    usuario,
    catalogo
) {
    return Object.fromEntries(
        acciones.map(
            (accion) => [
                accion,
                tienePermiso(
                    usuario,
                    catalogo,
                    accion
                ),
            ]
        )
    );
}
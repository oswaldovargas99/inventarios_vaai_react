import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export async function listarProveedores(params = {}, signal) {
    const { data } = await api.get('/api/proveedores', { params, signal });
    return data;
}

export async function crearProveedor(formulario) {
    await api.get('/sanctum/csrf-cookie');
    const payload = prepararPayload(formulario);
    const { data } = await api.post('/api/proveedores', payload);
    return data;
}

export async function actualizarProveedor(id, formulario) {
    await api.get('/sanctum/csrf-cookie');

    // SI YA ES UN FORMDATA (enviado desde la vista): Se envía directamente sin alterar
    if (formulario instanceof FormData) {
        const { data } = await api.post(`/api/proveedores/${id}`, formulario);
        return data;
    }

    // SI ES UN OBJETO PLANO: Se procesa y prepara el payload adecuado
    const payload = prepararPayload(formulario, true);

    if (payload instanceof FormData) {
        const { data } = await api.post(`/api/proveedores/${id}`, payload);
        return data;
    }

    const { data } = await api.put(`/api/proveedores/${id}`, payload);
    return data;
}

export async function cambiarEstatusProveedor(id, activo) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.patch(`/api/proveedores/${id}/estatus`, { activo });
    return data;
}

export async function eliminarProveedor(id) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.delete(`/api/proveedores/${id}`);
    return data;
}

/**
 * Descarga u obtiene el archivo binario de la constancia SAT resguardada por autenticación.
 */
export async function descargarConstanciaProveedor(id) {
    const respuesta = await api.get(`/api/proveedores/${id}/constancia`, {
        responseType: 'blob',
    });
    return respuesta;
}

/*
|--------------------------------------------------------------------------
| Auxiliar para objetos de estado React
|--------------------------------------------------------------------------
*/
function prepararPayload(formulario, esActualizacion = false) {
    const tieneArchivoNuevo = formulario.constancia_sat instanceof File;

    const campos = {
        nombre_proveedor: formulario.nombre_proveedor?.trim() || '',
        razon_social: formulario.razon_social?.trim() || '',
        direccion: formulario.direccion?.trim() || '',
        telefono: formulario.telefono?.trim() || '',
        correo: formulario.correo?.trim() || '',
        activo: formulario.activo ? 1 : 0,
    };

    if (!tieneArchivoNuevo) {
        return campos;
    }

    const datos = new FormData();
    Object.entries(campos).forEach(([clave, valor]) => {
        datos.append(clave, String(valor));
    });

    datos.append('constancia_sat', formulario.constancia_sat);

    if (esActualizacion) {
        datos.append('_method', 'PUT');
    }

    return datos;
}
import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export async function listarCotizaciones(params = {}, signal) {
    const { data } = await api.get('/api/cotizaciones', { params, signal });
    return data;
}

export async function crearCotizacion(formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post('/api/cotizaciones', formulario);
    return data;
}

export async function actualizarCotizacion(id, formulario) {
    await api.get('/sanctum/csrf-cookie');

    // Si el formulario incluye archivos (FormData), Laravel requiere POST con _method: 'PUT'
    if (formulario instanceof FormData) {
        if (!formulario.has('_method')) {
            formulario.append('_method', 'PUT');
        }
        const { data } = await api.post(`/api/cotizaciones/${id}`, formulario);
        return data;
    }

    const { data } = await api.put(`/api/cotizaciones/${id}`, formulario);
    return data;
}

export async function eliminarCotizacion(id) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.delete(`/api/cotizaciones/${id}`);
    return data;
}

export async function descargarArchivoCotizacion(id, tipo) {
    await api.get('/sanctum/csrf-cookie');
    // Se devuelve la respuesta HTTP completa de Axios para dar acceso a headers y a la data (Blob)
    const response = await api.get(`/api/cotizaciones/${id}/descargar`, {
        params: { tipo },
        responseType: 'blob',
    });
    return response;
}
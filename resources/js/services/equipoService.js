import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export async function listarEquipos(params = {}, signal) {
    const { data } = await api.get('/api/equipos', { params, signal });
    return data;
}

export async function listarTraslados(params = {}, signal) {
    const { data } = await api.get('/api/equipos/traslados', { params, signal });
    return data;
}

export async function crearTraslado(formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post('/api/equipos/traslados', formulario);
    return data;
}

export async function listarTiposEquipo(signal) {
    const { data } = await api.get('/api/tipos-equipo', { signal });
    return data.data;
}

export async function listarModelos(signal) {
    const { data } = await api.get('/api/modelos', { params: { per_page: 100 }, signal });
    return data.data.data;
}

export async function crearEquipo(formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post('/api/equipos', formulario);
    return data;
}

export async function actualizarEquipo(id, datos) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.patch(`/api/equipos/${id}`, datos);
    return data;
}

export async function eliminarEquipo(id) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.delete(`/api/equipos/${id}`);
    return data;
}

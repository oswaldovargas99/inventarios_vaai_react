import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export async function listarDependencias(params = {}, signal) {
    const { data } = await api.get('/api/dependencias', { params, signal });
    return data;
}

export async function listarPaises(signal) {
    const { data } = await api.get('/api/dependencias/paises', { signal });
    return data;
}

export async function listarEntidadesFederativas(params = {}, signal) {
    const { data } = await api.get('/api/dependencias/entidades-federativas', { params, signal });
    return data;
}

export async function buscarCodigoPostal(codigoPostal, signal) {
    const { data } = await api.get(`/api/dependencias/codigo-postal/${codigoPostal}`, { signal });
    return data;
}

export async function crearDependencia(formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post('/api/dependencias', formulario);
    return data;
}

export async function actualizarDependencia(id, formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.patch(`/api/dependencias/${id}`, formulario);
    return data;
}

export async function eliminarDependencia(id) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.delete(`/api/dependencias/${id}`);
    return data;
}

import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export async function listarUsuarios(params = {}, signal) {
    const { data } = await api.get('/api/usuarios', { params, signal });
    return data;
}

export async function crearUsuario(formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post('/api/usuarios', formulario);
    return data;
}

export async function actualizarUsuario(id, formulario) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.patch(`/api/usuarios/${id}`, formulario);
    return data;
}

export async function eliminarUsuario(id) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.delete(`/api/usuarios/${id}`);
    return data;
}
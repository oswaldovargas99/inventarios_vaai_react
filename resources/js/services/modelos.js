import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export const listarModelos = (params, signal) => api.get('/api/modelos', { params, signal });

export async function listarMarcas(signal) {
    const marcas = [];
    let page = 1;
    let ultimaPagina = 1;
    do {
        const { data } = await api.get('/api/marcas', { params: { page }, signal });
        marcas.push(...data.data.data);
        ultimaPagina = data.data.last_page;
        page += 1;
    } while (page <= ultimaPagina);
    return marcas;
}

export async function guardarModelo(id, formulario) {
    await api.get('/sanctum/csrf-cookie');
    return id
        ? api.put(`/api/modelos/${id}`, formulario)
        : api.post('/api/modelos', formulario);
}

export async function modificarModelo(id, accion) {
    await api.get('/sanctum/csrf-cookie');
    return accion === 'eliminar'
        ? api.delete(`/api/modelos/${id}`)
        : api.patch(`/api/modelos/${id}/estatus`);
}

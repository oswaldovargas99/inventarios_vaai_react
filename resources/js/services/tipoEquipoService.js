import axios from 'axios';

const API_URL = '/api/tipos-equipo';

export const obtenerTiposEquipo = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const crearTipoEquipo = async (datos) => {
    const response = await axios.post(API_URL, datos);
    return response.data;
};

export const actualizarTipoEquipo = async (id, datos) => {
    const response = await axios.put(`${API_URL}/${id}`, datos);
    return response.data;
};

export const cambiarEstatusTipoEquipo = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/estatus`);
    return response.data;
};

export const eliminarTipoEquipo = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
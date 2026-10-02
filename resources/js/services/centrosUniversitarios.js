import axios from 'axios';

const api = axios.create({ withCredentials: true, withXSRFToken: true });

export async function listarCentrosUniversitarios(params = {}, signal) {
    const { data } = await api.get('/api/centros-universitarios', { params, signal });
    return data;
}

export function etiquetaCentroUniversitario(centro) {
    if (!centro) return '';
    if (centro.abreviatura && centro.nombre) {
        return `${centro.abreviatura} — ${centro.nombre}`;
    }
    return centro.nombre || centro.abreviatura || '';
}

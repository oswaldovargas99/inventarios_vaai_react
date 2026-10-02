import axios from 'axios';

// Contrato actual de UsuarioRolActivoMiddleware para endpoints privados.
// Un 403 de RolMiddleware no invalida la sesión.
const mensajesSesionInvalidada = new Set([
    'El usuario se encuentra inactivo.',
    'El usuario no tiene un rol asignado.',
    'El rol asignado al usuario se encuentra inactivo.',
]);

export function esSesionInvalidada(error) {
    return error.response?.status === 401
        || (error.response?.status === 403
            && mensajesSesionInvalidada.has(error.response?.data?.message));
}

export async function obtenerCookieCsrf() {
    await axios.get('/sanctum/csrf-cookie');
}

export async function iniciarSesion(credenciales) {
    await obtenerCookieCsrf();
    const response = await axios.post('/api/login', credenciales);
    return response.data.usuario;
}

export async function obtenerUsuario() {
    const response = await axios.get('/api/user');
    return response.data.usuario;
}

export async function cerrarSesion() {
    await obtenerCookieCsrf();
    await axios.post('/api/logout');
}

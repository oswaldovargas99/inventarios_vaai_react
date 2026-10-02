import React, {
    createContext, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
    cerrarSesion, esSesionInvalidada, iniciarSesion, obtenerUsuario,
} from '../services/authService';

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargandoInicial, setCargandoInicial] = useState(true);
    const [errorAutenticacion, setErrorAutenticacion] = useState(null);
    const [errorRecuperacion, setErrorRecuperacion] = useState(null);
    const montado = useRef(false);
    const inicializado = useRef(false);
    const consultaPendiente = useRef(null);
    const versionSesion = useRef(0);
    const mutacionPendiente = useRef(false);

    const manejarErrorSesion = useCallback((error) => {
        if (!esSesionInvalidada(error) || mutacionPendiente.current) {
            return false;
        }

        versionSesion.current += 1;
        consultaPendiente.current = null;
        if (montado.current) {
            setUsuario(null);
            setErrorAutenticacion(error);
            setErrorRecuperacion(null);
            setCargandoInicial(false);
        }
        return true;
    }, []);

    const refreshUser = useCallback(() => {
        if (mutacionPendiente.current) {
            return Promise.resolve(null);
        }

        if (consultaPendiente.current) {
            return consultaPendiente.current;
        }

        const version = versionSesion.current;
        setCargandoInicial(true);
        setErrorRecuperacion(null);
        const vigente = () => montado.current && version === versionSesion.current;

        const consulta = obtenerUsuario()
            .then((nuevoUsuario) => {
                if (vigente()) {
                    setUsuario(nuevoUsuario ?? null);
                    setErrorAutenticacion(null);
                    setErrorRecuperacion(null);
                }
                return vigente() ? nuevoUsuario : null;
            })
            .catch((error) => {
                if (vigente()) {
                    if (esSesionInvalidada(error)) {
                        manejarErrorSesion(error);
                    } else {
                        setErrorRecuperacion(error);
                    }
                    setErrorAutenticacion(error);
                }
                // El error queda disponible en el contexto, incluso en la carga inicial.
                return null;
            })
            .finally(() => {
                if (consultaPendiente.current === consulta) {
                    consultaPendiente.current = null;
                }
                if (vigente()) {
                    setCargandoInicial(false);
                }
            });

        consultaPendiente.current = consulta;
        return consulta;
    }, [manejarErrorSesion]);

    useEffect(() => {
        montado.current = true;
        // La referencia persiste durante la repetición de efectos de StrictMode.
        if (!inicializado.current) {
            inicializado.current = true;
            void refreshUser();
        }
        return () => {
            montado.current = false;
        };
    }, [refreshUser]);

    const ejecutarMutacion = useCallback(async (operacion) => {
        if (mutacionPendiente.current) {
            throw new Error('Ya hay una operación de autenticación en curso.');
        }

        mutacionPendiente.current = true;
        // Una respuesta anterior de /api/user no debe restaurar otra sesión.
        versionSesion.current += 1;
        consultaPendiente.current = null;
        setErrorAutenticacion(null);
        setErrorRecuperacion(null);

        try {
            const nuevoUsuario = await operacion();
            if (montado.current) {
                setUsuario(nuevoUsuario ?? null);
            }
            return nuevoUsuario;
        } catch (error) {
            if (montado.current) {
                // Login no pasa por UsuarioRolActivoMiddleware: sus 403
                // rechazan credenciales/cuenta, no invalidan una sesión previa.
                if (error.response?.status === 401) {
                    setUsuario(null);
                }
                setErrorAutenticacion(error);
            }
            throw error;
        } finally {
            mutacionPendiente.current = false;
            if (montado.current) {
                setCargandoInicial(false);
            }
        }
    }, []);

    const login = useCallback((credenciales) => (
        ejecutarMutacion(() => iniciarSesion(credenciales))
    ), [ejecutarMutacion]);

    const logout = useCallback(() => ejecutarMutacion(async () => {
        try {
            await cerrarSesion();
        } catch (error) {
            if (error.response?.status !== 401) {
                throw error;
            }
        }
        return null;
    }), [ejecutarMutacion]);

    const value = useMemo(() => ({
        usuario,
        rol: usuario?.rol?.nombre ?? null,
        cargandoInicial,
        errorAutenticacion,
        errorRecuperacion,
        manejarErrorSesion,
        login,
        logout,
        refreshUser,
    }), [usuario, cargandoInicial, errorAutenticacion, errorRecuperacion,
        manejarErrorSesion, login, logout, refreshUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

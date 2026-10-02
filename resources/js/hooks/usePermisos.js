import { useMemo } from 'react';
import useAuth from './useAuth';
import { obtenerPermisos } from '../auth/permisos';

export default function usePermisos(catalogo) {
    const { usuario, cargandoInicial } = useAuth();

    return useMemo(() => (
        obtenerPermisos(cargandoInicial ? null : usuario, catalogo)
    ), [usuario, cargandoInicial, catalogo]);
}

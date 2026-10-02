import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { tienePermiso } from '../auth/permisos';
import AccesoDenegado from './AccesoDenegado';
import { CAlert, CButton } from '@coreui/react';

function ProtectedRoute({ children, catalogo, permiso }) {
    const { usuario, cargandoInicial, errorRecuperacion, refreshUser } = useAuth();

    // Mientras Laravel verifica la sesión
    if (cargandoInicial) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    Verificando sesión...
                </p>
            </div>
        );
    }

    if (errorRecuperacion) {
        return (
            <div className="p-4">
                <CAlert color="warning">
                    No fue posible verificar la sesión. Intenta nuevamente.
                </CAlert>
                <CButton color="primary" onClick={() => void refreshUser()}>
                    Reintentar
                </CButton>
            </div>
        );
    }

    // Si no existe una sesión válida
    if (!usuario) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // Sin metadatos se conserva la protección exclusiva de sesión del layout.
    if ((catalogo !== undefined || permiso !== undefined)
        && !tienePermiso(usuario, catalogo, permiso)) {
        return <AccesoDenegado />;
    }

    // Usuario autenticado y autorizado
    return children;
}

export default ProtectedRoute;

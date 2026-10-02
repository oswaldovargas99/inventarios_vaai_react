import React from 'react';
import { CAlert, CCard, CCardBody } from '@coreui/react';

export default function AccesoDenegado() {
    return (
        <CCard className="catalog-card my-4">
            <CCardBody className="p-4">
                <h2 className="page-title mb-3">Acceso denegado</h2>
                <CAlert color="warning" className="mb-0">
                    No tienes permisos para acceder a esta sección.
                    Si necesitas acceso, contacta al administrador del sistema.
                </CAlert>
            </CCardBody>
        </CCard>
    );
}

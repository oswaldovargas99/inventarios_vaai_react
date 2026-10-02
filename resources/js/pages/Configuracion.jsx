import React from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';

function Configuracion() {
    return (
        <CCard className="catalog-card catalog-view">
            <CCardHeader>
                <strong>Configuración</strong>
                <div className="small text-body-secondary">Ajustes del sistema</div>
            </CCardHeader>
            <CCardBody>
                <div className="text-body-secondary py-5 text-center">
                    Esta sección estará disponible próximamente.
                </div>
            </CCardBody>
        </CCard>
    );
}

export default Configuracion;

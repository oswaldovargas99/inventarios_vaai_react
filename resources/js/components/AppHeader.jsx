import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

import {
    CButton,
    CContainer,
    CHeader,
    CHeaderNav,
    CSpinner,
} from '@coreui/react';

import CIcon from '@coreui/icons-react';

import {
    cilAccountLogout,
    cilMenu,
    cilUser,
} from '@coreui/icons';

const AppHeader = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [cerrandoSesion, setCerrandoSesion] = useState(false);
    const [errorLogout, setErrorLogout] = useState('');

    const cerrarSesion = async () => {
        if (cerrandoSesion) {
            return;
        }

        setCerrandoSesion(true);
        setErrorLogout('');

        try {
            await logout();

            navigate('/login', {
                replace: true,
            });
        } catch (error) {
            console.error(
                'Error al cerrar sesión:',
                error
            );

            setErrorLogout(
                error.response?.data?.message ??
                'No fue posible cerrar la sesión.'
            );
        } finally {
            setCerrandoSesion(false);
        }
    };

    return (
        <CHeader
            position="sticky"
            className="mb-4 border-bottom bg-body"
        >

            <CContainer
                fluid
                className="px-4 py-2"
            >

                <CButton
                    type="button"
                    color="light"
                    className="d-lg-none border me-3"
                    title="Abrir menú lateral"
                    aria-label="Abrir menú lateral"
                    onClick={onMenuClick}
                >
                    <CIcon icon={cilMenu} />
                </CButton>

                {/* Nombre del sistema */}

                <div>
                    <h5 className="mb-0 fw-semibold">
                        Sistema de Inventarios
                    </h5>

                    <small className="text-body-secondary">
                        VAAI
                    </small>
                </div>


                {/* Usuario */}

                <CHeaderNav className="ms-auto">

                    <div className="d-flex align-items-center gap-3">

                        {errorLogout && (
                            <span className="small text-danger">
                                {errorLogout}
                            </span>
                        )}


                        {usuario && (

                            <div className="d-none d-sm-flex align-items-center gap-2">

                                {/* Icono */}

                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-body-tertiary"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                    }}
                                >
                                    <CIcon
                                        icon={cilUser}
                                        size="lg"
                                    />
                                </div>


                                {/* Datos */}

                                <div className="text-end">

                                    <div className="fw-semibold small">

                                        {usuario.nombre}{' '}

                                        {usuario.apellido_paterno ?? ''}

                                    </div>


                                    <div className="small text-body-secondary">

                                        {usuario.rol?.nombre ?? ''}

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* Botón cerrar sesión */}

                        <CButton
                            type="button"
                            color="light"
                            className="border d-flex align-items-center gap-2"
                            disabled={cerrandoSesion}
                            onClick={cerrarSesion}
                        >

                            {cerrandoSesion ? (

                                <>
                                    <CSpinner
                                        size="sm"
                                    />

                                    <span className="d-none d-md-inline">
                                        Cerrando...
                                    </span>
                                </>

                            ) : (

                                <>
                                    <CIcon
                                        icon={cilAccountLogout}
                                    />

                                    <span className="d-none d-md-inline">
                                        Cerrar sesión
                                    </span>
                                </>

                            )}

                        </CButton>

                    </div>

                </CHeaderNav>

            </CContainer>

        </CHeader>
    );
};

export default AppHeader;

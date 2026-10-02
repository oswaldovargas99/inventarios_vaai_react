import React, { useRef, useState } from 'react';
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CRow,
    CSpinner,
} from '@coreui/react';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import { crearProveedor } from '../../services/proveedorService';

const formularioInicial = {
    nombre_proveedor: '',
    razon_social: '',
    correo: '',
    telefono: '',
    direccion: '',
    constancia_sat: null,
};

function AltaProveedor() {
    const permisos = usePermisos('proveedores');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;

    const [formulario, setFormulario] = useState(formularioInicial);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [errores, setErrores] = useState({});

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) {
            setErrores((actual) => ({ ...actual, [name]: undefined }));
        }
    };

    const cambiarArchivo = (event) => {
        const archivo = event.target.files?.[0] ?? null;
        setFormulario((actual) => ({ ...actual, constancia_sat: archivo }));
        if (errores.constancia_sat) {
            setErrores((actual) => ({ ...actual, constancia_sat: undefined }));
        }
    };

    const guardar = async (event) => {
        event.preventDefault();
        if (!permisos.crear || guardando) return;

        const erroresFormulario = {};
        if (!formulario.nombre_proveedor.trim()) erroresFormulario.nombre_proveedor = ['El nombre del proveedor es obligatorio.'];
        if (!formulario.razon_social.trim()) erroresFormulario.razon_social = ['La razón social es obligatoria.'];
        if (!formulario.correo.trim()) erroresFormulario.correo = ['El correo electrónico es obligatorio.'];
        if (!formulario.telefono.trim()) erroresFormulario.telefono = ['El teléfono es obligatorio.'];
        if (!formulario.direccion.trim()) erroresFormulario.direccion = ['Escribe la dirección del proveedor.'];
        if (!formulario.constancia_sat) erroresFormulario.constancia_sat = ['Adjunta la constancia del SAT.'];

        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de registrar el proveedor.' });
            return;
        }

        setGuardando(true);
        setMensaje(null);
        setErrores({});

        try {
            const respuesta = await crearProveedor({
                ...formulario,
                nombre_proveedor: formulario.nombre_proveedor.trim(),
                razon_social: formulario.razon_social.trim(),
                correo: formulario.correo.trim(),
                telefono: formulario.telefono.trim(),
                direccion: formulario.direccion.trim(),
            });
            setMensaje({ color: 'success', texto: respuesta.message });
            setFormulario(formularioInicial);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible registrar el proveedor.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    const errorDe = (campo) => errores[campo]?.[0];

    return (
        <CRow className="g-4">
            <CCol xs={12}>
                <CCard>
                    <CCardHeader><strong>Alta de proveedor</strong></CCardHeader>
                    <CCardBody>
                        {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                        {permisos.crear ? (
                            <CForm onSubmit={guardar} className="needs-validation" noValidate>
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="nombre-proveedor">Nombre del proveedor</CFormLabel>
                                        <CFormInput id="nombre-proveedor" name="nombre_proveedor" value={formulario.nombre_proveedor} onChange={cambiarCampo} maxLength={150} required invalid={Boolean(errorDe('nombre_proveedor'))} />
                                        {errorDe('nombre_proveedor') && <div className="invalid-feedback d-block">{errorDe('nombre_proveedor')}</div>}
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="razon-social">Razón social</CFormLabel>
                                        <CFormInput id="razon-social" name="razon_social" value={formulario.razon_social} onChange={cambiarCampo} maxLength={200} required invalid={Boolean(errorDe('razon_social'))} />
                                        {errorDe('razon_social') && <div className="invalid-feedback d-block">{errorDe('razon_social')}</div>}
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="correo-proveedor">Correo electrónico</CFormLabel>
                                        <CFormInput id="correo-proveedor" name="correo" type="email" value={formulario.correo} onChange={cambiarCampo} maxLength={150} required invalid={Boolean(errorDe('correo'))} />
                                        {errorDe('correo') && <div className="invalid-feedback d-block">{errorDe('correo')}</div>}
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="telefono-proveedor">Teléfono</CFormLabel>
                                        <CFormInput id="telefono-proveedor" name="telefono" value={formulario.telefono} onChange={cambiarCampo} maxLength={20} required invalid={Boolean(errorDe('telefono'))} />
                                        {errorDe('telefono') && <div className="invalid-feedback d-block">{errorDe('telefono')}</div>}
                                    </CCol>
                                    <CCol xs={12}>
                                        <CFormLabel htmlFor="direccion-proveedor">Dirección</CFormLabel>
                                        <CFormTextarea id="direccion-proveedor" name="direccion" value={formulario.direccion} onChange={cambiarCampo} maxLength={255} rows={3} required invalid={Boolean(errorDe('direccion'))} />
                                        {errorDe('direccion') && <div className="invalid-feedback d-block">{errorDe('direccion')}</div>}
                                    </CCol>
                                    <CCol xs={12}>
                                        <CFormLabel htmlFor="constancia-sat">Constancia del SAT (PDF, JPG, PNG - máx. 5MB)</CFormLabel>
                                        <CFormInput id="constancia-sat" name="constancia_sat" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={cambiarArchivo} required invalid={Boolean(errorDe('constancia_sat'))} />
                                        {errorDe('constancia_sat') && <div className="invalid-feedback d-block">{errorDe('constancia_sat')}</div>}
                                    </CCol>
                                    <CCol xs={12}>
                                        <CButton color="primary" type="submit" disabled={guardando}>{guardando ? <><CSpinner size="sm" className="me-2" />Guardando...</> : 'Registrar proveedor'}</CButton>
                                    </CCol>
                                </CRow>
                            </CForm>
                        ) : <CAlert color="info">No tienes permisos para registrar proveedores.</CAlert>}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default AltaProveedor;
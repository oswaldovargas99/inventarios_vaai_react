import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
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
    CFormSelect,
    CFormTextarea,
    CRow,
    CSpinner,
} from '@coreui/react';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import {
    crearEquipo,
    listarModelos,
    listarTiposEquipo,
} from '../../services/equipoService';

const formularioInicial = {
    id_equipo: '',
    tipo_equipo_id: '',
    modelo_id: '',
    numero_serie: '',
    descripcion: '',
};

function AltaEquipo() {
    const permisos = usePermisos('equipos');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;
    const [formulario, setFormulario] = useState(formularioInicial);
    const [tiposEquipo, setTiposEquipo] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [errores, setErrores] = useState({});

    const cargarDatos = async (signal) => {
        try {
            const [tipos, modelosDisponibles] = await Promise.all([
                listarTiposEquipo(signal),
                listarModelos(signal),
            ]);
            if (!signal.aborted) {
                setTiposEquipo(tipos ?? []);
                setModelos(modelosDisponibles ?? []);
            }
        } catch (error) {
            if (!signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: 'No fue posible cargar la información de equipos.' });
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        void cargarDatos(controller.signal);
        return () => controller.abort();
    }, []);

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) {
            setErrores((actual) => ({ ...actual, [name]: undefined }));
        }
    };

    const guardar = async (event) => {
        event.preventDefault();
        if (!permisos.crear || guardando) return;

        const erroresFormulario = {};
        if (!formulario.id_equipo.trim()) erroresFormulario.id_equipo = ['El ID del equipo es obligatorio.'];
        if (!formulario.numero_serie.trim()) erroresFormulario.numero_serie = ['El número de serie es obligatorio.'];
        if (!formulario.tipo_equipo_id) erroresFormulario.tipo_equipo_id = ['Selecciona un tipo de equipo.'];
        if (!formulario.modelo_id) erroresFormulario.modelo_id = ['Selecciona un modelo.'];
        if (!formulario.descripcion.trim()) erroresFormulario.descripcion = ['Escribe una descripción del equipo.'];

        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de registrar el equipo.' });
            return;
        }

        setGuardando(true);
        setMensaje(null);
        setErrores({});

        try {
            const respuesta = await crearEquipo({
                ...formulario,
                id_equipo: formulario.id_equipo.trim(),
                numero_serie: formulario.numero_serie.trim(),
                descripcion: formulario.descripcion.trim() || null,
            });
            setMensaje({ color: 'success', texto: respuesta.message });
            setFormulario(formularioInicial);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible registrar el equipo.' });
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
                    <CCardHeader><strong>Alta de equipo</strong></CCardHeader>
                    <CCardBody>
                        {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                        {permisos.crear ? (
                            <CForm onSubmit={guardar} className="needs-validation" noValidate>
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="id-equipo">ID del equipo</CFormLabel>
                                        <CFormInput id="id-equipo" name="id_equipo" value={formulario.id_equipo} onChange={cambiarCampo} maxLength={50} required invalid={Boolean(errorDe('id_equipo'))} />
                                        {errorDe('id_equipo') && <div className="invalid-feedback d-block">{errorDe('id_equipo')}</div>}
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="numero-serie">Número de serie</CFormLabel>
                                        <CFormInput id="numero-serie" name="numero_serie" value={formulario.numero_serie} onChange={cambiarCampo} maxLength={100} required invalid={Boolean(errorDe('numero_serie'))} />
                                        {errorDe('numero_serie') && <div className="invalid-feedback d-block">{errorDe('numero_serie')}</div>}
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="tipo-equipo">Tipo de equipo</CFormLabel>
                                        <CFormSelect id="tipo-equipo" name="tipo_equipo_id" value={formulario.tipo_equipo_id} onChange={cambiarCampo} required invalid={Boolean(errorDe('tipo_equipo_id'))}>
                                            <option value="">Selecciona un tipo</option>
                                            {tiposEquipo.filter((tipo) => tipo.estatus).map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                                        </CFormSelect>
                                        {errorDe('tipo_equipo_id') && <div className="invalid-feedback d-block">{errorDe('tipo_equipo_id')}</div>}
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="modelo-equipo">Modelo</CFormLabel>
                                        <CFormSelect id="modelo-equipo" name="modelo_id" value={formulario.modelo_id} onChange={cambiarCampo} required invalid={Boolean(errorDe('modelo_id'))}>
                                            <option value="">Selecciona un modelo</option>
                                            {modelos.filter((modelo) => modelo.estatus).map((modelo) => <option key={modelo.id} value={modelo.id}>{modelo.nombre}{modelo.marca ? ` - ${modelo.marca.nombre}` : ''}</option>)}
                                        </CFormSelect>
                                        {errorDe('modelo_id') && <div className="invalid-feedback d-block">{errorDe('modelo_id')}</div>}
                                    </CCol>
                                    <CCol xs={12}>
                                        <CFormLabel htmlFor="descripcion-equipo">Descripción</CFormLabel>
                                        <CFormTextarea id="descripcion-equipo" name="descripcion" value={formulario.descripcion} required invalid={Boolean(errorDe('descripcion'))} onChange={cambiarCampo} maxLength={255} rows={3} />
                                        {errorDe('descripcion') && <div className="invalid-feedback d-block">{errorDe('descripcion')}</div>}
                                    </CCol>
                                    <CCol xs={12}>
                                        <CButton color="primary" type="submit" disabled={guardando}>{guardando ? <><CSpinner size="sm" className="me-2" />Guardando...</> : 'Registrar equipo'}</CButton>
                                    </CCol>
                                </CRow>
                            </CForm>
                        ) : <CAlert color="info">No tienes permisos para registrar equipos.</CAlert>}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default AltaEquipo;

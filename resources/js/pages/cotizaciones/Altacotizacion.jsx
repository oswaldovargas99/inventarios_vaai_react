import React, { useEffect, useRef, useState } from 'react';
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
import { crearCotizacion } from '../../services/cotizacionService';
import { listarProveedores } from '../../services/proveedorService';

const formularioInicial = {
    nombre_solicitante: '',
    descripcion: '',
    monto: '',
    proveedor_id: '',
    fecha_solicitud: new Date().toISOString().split('T')[0],
    fecha_entrega: '',
    cotizacion: null,
    facturas: null,
};

function Altacotizacion() {
    const permisos = usePermisos('cotizaciones');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;

    const [formulario, setFormulario] = useState(formularioInicial);
    const [proveedores, setProveedores] = useState([]);
    const [cargandoProveedores, setCargandoProveedores] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [errores, setErrores] = useState({});
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    useEffect(() => {
        const controller = new AbortController();
        setCargandoProveedores(true);
        listarProveedores({ page: 1 }, controller.signal)
            .then((respuesta) => {
                if (!controller.signal.aborted) {
                    const datos = respuesta.data?.data ?? respuesta.data ?? [];
                    setProveedores(datos);
                }
            })
            .catch((error) => {
                if (!controller.signal.aborted && !manejarError.current(error)) {
                    setMensaje({ color: 'warning', texto: 'No se pudo cargar la lista de proveedores.' });
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargandoProveedores(false);
            });

        return () => controller.abort();
    }, []);

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) {
            setErrores((actual) => ({ ...actual, [name]: undefined }));
        }
    };

    const cambiarArchivo = (event) => {
        const { name, files } = event.target;
        const archivo = files?.[0] ?? null;
        setFormulario((actual) => ({ ...actual, [name]: archivo }));
        
        // Limpiar errores asociados al archivo
        if (errores[name] || errores['archivo_cotizacion'] || errores['archivo_factura']) {
            setErrores((actual) => ({
                ...actual,
                [name]: undefined,
                archivo_cotizacion: undefined,
                archivo_factura: undefined,
            }));
        }
    };

    const guardar = async (event) => {
        event.preventDefault();
        if (!permisos.crear || guardando) return;

        const erroresFormulario = {};

        // Validaciones del cliente específicas por cada campo
        if (!formulario.nombre_solicitante.trim()) {
            erroresFormulario.nombre_solicitante = ['El nombre del solicitante es obligatorio.'];
        } else if (formulario.nombre_solicitante.trim().length > 150) {
            erroresFormulario.nombre_solicitante = ['El nombre del solicitante no debe exceder los 150 caracteres.'];
        }

        if (!formulario.descripcion.trim()) {
            erroresFormulario.descripcion = ['La descripción detallada es obligatoria.'];
        }

        if (!formulario.monto || Number(formulario.monto) <= 0) {
            erroresFormulario.monto = ['El monto es obligatorio y debe ser mayor a 0.'];
        }

        if (!formulario.proveedor_id) {
            erroresFormulario.proveedor_id = ['Debes seleccionar un proveedor de la lista.'];
        }

        if (!formulario.fecha_solicitud) {
            erroresFormulario.fecha_solicitud = ['La fecha de solicitud es obligatoria.'];
        }

        if (formulario.fecha_entrega && formulario.fecha_entrega < formulario.fecha_solicitud) {
            erroresFormulario.fecha_entrega = ['La fecha de entrega no puede ser anterior a la fecha de solicitud.'];
        }

        // Nuevas validaciones para hacer obligatorios los archivos
        if (!formulario.cotizacion) {
            erroresFormulario.cotizacion = ['El archivo adjunto de la cotización es obligatorio.'];
        }

        if (!formulario.facturas) {
            erroresFormulario.facturas = ['El archivo adjunto de las facturas es obligatorio.'];
        }

        // Si existe CUALQUIER error, se detiene el envío y se muestran los mensajes
        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Revisa los errores específicos en el formulario antes de enviarlo.' });
            return;
        }

        setGuardando(true);
        setMensaje(null);
        setErrores({});

        try {
            const formData = new FormData();
            formData.append('nombre_solicitante', formulario.nombre_solicitante.trim());
            formData.append('descripcion', formulario.descripcion.trim());
            formData.append('monto', formulario.monto);
            formData.append('proveedor_id', formulario.proveedor_id);
            formData.append('fecha_solicitud', formulario.fecha_solicitud);

            if (formulario.fecha_entrega) {
                formData.append('fecha_entrega', formulario.fecha_entrega);
            }

            formData.append('cotizacion', formulario.cotizacion);
            formData.append('facturas', formulario.facturas);

            const respuesta = await crearCotizacion(formData);
            setMensaje({ color: 'success', texto: respuesta.message ?? 'Cotización registrada correctamente.' });
            
            // Reiniciar formulario
            setFormulario(formularioInicial);
            setFileInputKey(Date.now());
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({
                    color: 'danger',
                    texto: error.response?.data?.message ?? 'No fue posible registrar la cotización.',
                });
            }
        } finally {
            setGuardando(false);
        }
    };

    const errorDe = (campo) =>
        errores[campo]?.[0] ||
        (campo === 'cotizacion' ? errores['archivo_cotizacion']?.[0] : null) ||
        (campo === 'facturas' ? errores['archivo_factura']?.[0] : null);

    return (
        <CRow className="g-4">
            <CCol xs={12}>
                <CCard>
                    <CCardHeader>
                        <strong>Registrar cotización</strong>
                    </CCardHeader>
                    <CCardBody>
                        {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                        {permisos.crear ? (
                            <CForm onSubmit={guardar} className="needs-validation" noValidate>
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="nombre-solicitante">
                                            Nombre del solicitante <span className="text-danger">*</span>
                                        </CFormLabel>
                                        <CFormInput
                                            id="nombre-solicitante"
                                            name="nombre_solicitante"
                                            value={formulario.nombre_solicitante}
                                            onChange={cambiarCampo}
                                            maxLength={150}
                                            required
                                            invalid={Boolean(errorDe('nombre_solicitante'))}
                                            disabled={guardando}
                                        />
                                        {errorDe('nombre_solicitante') && (
                                            <div className="invalid-feedback d-block">{errorDe('nombre_solicitante')}</div>
                                        )}
                                    </CCol>

                                    <CCol md={6}>
                                        <CFormLabel htmlFor="proveedor-id">
                                            Proveedor <span className="text-danger">*</span>
                                        </CFormLabel>
                                        <CFormSelect
                                            id="proveedor-id"
                                            name="proveedor_id"
                                            value={formulario.proveedor_id}
                                            onChange={cambiarCampo}
                                            required
                                            invalid={Boolean(errorDe('proveedor_id'))}
                                            disabled={guardando || cargandoProveedores}
                                        >
                                            <option value="">
                                                {cargandoProveedores ? 'Cargando proveedores...' : '-- Selecciona un proveedor --'}
                                            </option>
                                            {proveedores.map((proveedor) => (
                                                <option key={proveedor.id} value={proveedor.id}>
                                                    {proveedor.nombre_proveedor} {proveedor.razon_social ? `(${proveedor.razon_social})` : ''}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                        {errorDe('proveedor_id') && (
                                            <div className="invalid-feedback d-block">{errorDe('proveedor_id')}</div>
                                        )}
                                    </CCol>

                                    <CCol md={4}>
                                        <CFormLabel htmlFor="monto-cotizacion">
                                            Monto ($) <span className="text-danger">*</span>
                                        </CFormLabel>
                                        <CFormInput
                                            id="monto-cotizacion"
                                            name="monto"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={formulario.monto}
                                            onChange={cambiarCampo}
                                            required
                                            invalid={Boolean(errorDe('monto'))}
                                            disabled={guardando}
                                        />
                                        {errorDe('monto') && (
                                            <div className="invalid-feedback d-block">{errorDe('monto')}</div>
                                        )}
                                    </CCol>

                                    <CCol md={4}>
                                        <CFormLabel htmlFor="fecha-solicitud">
                                            Fecha de solicitud <span className="text-danger">*</span>
                                        </CFormLabel>
                                        <CFormInput
                                            id="fecha-solicitud"
                                            name="fecha_solicitud"
                                            type="date"
                                            value={formulario.fecha_solicitud}
                                            onChange={cambiarCampo}
                                            required
                                            invalid={Boolean(errorDe('fecha_solicitud'))}
                                            disabled={guardando}
                                        />
                                        {errorDe('fecha_solicitud') && (
                                            <div className="invalid-feedback d-block">{errorDe('fecha_solicitud')}</div>
                                        )}
                                    </CCol>

                                    <CCol md={4}>
                                        <CFormLabel htmlFor="fecha-entrega">Fecha estimada de entrega</CFormLabel>
                                        <CFormInput
                                            id="fecha-entrega"
                                            name="fecha_entrega"
                                            type="date"
                                            value={formulario.fecha_entrega}
                                            onChange={cambiarCampo}
                                            invalid={Boolean(errorDe('fecha_entrega'))}
                                            disabled={guardando}
                                        />
                                        {errorDe('fecha_entrega') && (
                                            <div className="invalid-feedback d-block">{errorDe('fecha_entrega')}</div>
                                        )}
                                    </CCol>

                                    <CCol xs={12}>
                                        <CFormLabel htmlFor="descripcion-cotizacion">
                                            Descripción <span className="text-danger">*</span>
                                        </CFormLabel>
                                        <CFormTextarea
                                            id="descripcion-cotizacion"
                                            name="descripcion"
                                            value={formulario.descripcion}
                                            onChange={cambiarCampo}
                                            rows={3}
                                            required
                                            invalid={Boolean(errorDe('descripcion'))}
                                            disabled={guardando}
                                        />
                                        {errorDe('descripcion') && (
                                            <div className="invalid-feedback d-block">{errorDe('descripcion')}</div>
                                        )}
                                    </CCol>

                                    {/* Carga de Archivo Cotización */}
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="archivo-cotizacion">
                                            Archivo de Cotización (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP) <span className="text-danger">*</span>
                                        </CFormLabel>
                                        <CFormInput
                                            key={`cotizacion-${fileInputKey}`}
                                            id="archivo-cotizacion"
                                            name="cotizacion"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                                            onChange={cambiarArchivo}
                                            required
                                            invalid={Boolean(errorDe('cotizacion'))}
                                            disabled={guardando}
                                        />
                                        {errorDe('cotizacion') && (
                                            <div className="invalid-feedback d-block">{errorDe('cotizacion')}</div>
                                        )}
                                    </CCol>

                                    {/* Carga de Archivo Facturas */}
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="archivo-facturas">
                                            Archivo de Facturas (PDF, XML, JPG, PNG) <span className="text-danger">*</span>
                                        </CFormLabel>
                                        <CFormInput
                                            key={`facturas-${fileInputKey}`}
                                            id="archivo-facturas"
                                            name="facturas"
                                            type="file"
                                            accept=".pdf,.xml,.jpg,.jpeg,.png"
                                            onChange={cambiarArchivo}
                                            required
                                            invalid={Boolean(errorDe('facturas'))}
                                            disabled={guardando}
                                        />
                                        {errorDe('facturas') && (
                                            <div className="invalid-feedback d-block">{errorDe('facturas')}</div>
                                        )}
                                    </CCol>

                                    <CCol xs={12}>
                                        <CButton color="primary" type="submit" disabled={guardando}>
                                            {guardando ? (
                                                <>
                                                    <CSpinner size="sm" className="me-2" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                'Registrar cotización'
                                            )}
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </CForm>
                        ) : (
                            <CAlert color="info">No tienes permisos para registrar cotizaciones.</CAlert>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Altacotizacion;
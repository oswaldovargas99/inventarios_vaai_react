import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    CAlert,
    CBadge,
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
    CInputGroup,
    CInputGroupText,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CPagination,
    CPaginationItem,
    CRow,
    CSpinner,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass, cilPaperclip, cilPencil, cilReload, cilTrash } from '@coreui/icons';
import { StatusBadge } from '../../components/catalogos/CatalogPresentation';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import {
    actualizarCotizacion,
    crearCotizacion,
    descargarArchivoCotizacion,
    eliminarCotizacion,
    listarCotizaciones,
} from '../../services/cotizacionService';
import { listarProveedores } from '../../services/proveedorService';

const filtrosIniciales = { buscar: '', page: 1 };

const formularioInicial = {
    nombre_solicitante: '',
    descripcion: '',
    monto: '',
    proveedor_id: '',
    fecha_solicitud: '',
    fecha_entrega: '',
    estatus: true,
    cotizacion: null,
    facturas: null,
};

function Cotizaciones() {
    const permisos = usePermisos('cotizaciones');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;

    const [listado, setListado] = useState({ data: [], total: 0, last_page: 1, current_page: 1 });
    const [proveedores, setProveedores] = useState([]);
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [revision, setRevision] = useState(0);
    const [mensaje, setMensaje] = useState(null);
    const [editor, setEditor] = useState(null);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [confirmacion, setConfirmacion] = useState(null);
    const [errores, setErrores] = useState({});
    const [descargando, setDescargando] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setCargando(true);
        listarCotizaciones(filtros, controller.signal)
            .then((respuesta) => {
                if (!controller.signal.aborted) setListado(respuesta.data ?? respuesta);
            })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar las cotizaciones.' });
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargando(false);
            });
        return () => controller.abort();
    }, [filtros, revision]);

    useEffect(() => {
        const controller = new AbortController();
        listarProveedores({ page: 1 }, controller.signal)
            .then((respuesta) => {
                if (!controller.signal.aborted) {
                    setProveedores(respuesta.data?.data ?? respuesta.data ?? []);
                }
            })
            .catch(() => {});
        return () => controller.abort();
    }, []);

    const cambiarFiltro = (event) => {
        const { name, value } = event.target;
        setFiltros((actual) => ({ ...actual, [name]: value, page: 1 }));
    };

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) setErrores((actual) => ({ ...actual, [name]: undefined }));
    };

    const cambiarArchivo = (event) => {
        const { name, files } = event.target;
        const archivo = files?.[0] ?? null;
        setFormulario((actual) => ({ ...actual, [name]: archivo }));
        if (errores[name]) setErrores((actual) => ({ ...actual, [name]: undefined }));
    };

    const obtenerFechaISO = (fechaCadena) => {
        if (!fechaCadena) return '';
        return fechaCadena.split('T')[0].split(' ')[0];
    };

    const formatearFecha = (fechaCadena) => {
        if (!fechaCadena) return '—';
        const soloFecha = fechaCadena.split('T')[0].split(' ')[0];
        const partes = soloFecha.split('-');
        if (partes.length !== 3) return '—';
        const [anio, mes, dia] = partes;
        return `${dia}/${mes}/${anio}`;
    };

    const abrirEditor = (itemCotizacion) => {
        if (!permisos.editar) return;
        setEditor(itemCotizacion);
        setFormulario({
            nombre_solicitante: itemCotizacion.nombre_solicitante ?? '',
            descripcion: itemCotizacion.descripcion ?? '',
            monto: itemCotizacion.monto ?? '',
            proveedor_id: itemCotizacion.proveedor_id ?? '',
            fecha_solicitud: obtenerFechaISO(itemCotizacion.fecha_solicitud),
            fecha_entrega: obtenerFechaISO(itemCotizacion.fecha_entrega),
            estatus: Boolean(itemCotizacion.estatus),
            cotizacion: null,
            facturas: null,
        });
        setMensaje(null);
        setErrores({});
    };

    const solicitarGuardado = (event) => {
        event.preventDefault();
        const esEdicion = Boolean(editor?.id);
        if (esEdicion && (!permisos.editar || guardando)) return;
        if (!esEdicion && (!permisos.crear || guardando)) return;

        const erroresFormulario = {};
        if (!formulario.nombre_solicitante.trim()) {
            erroresFormulario.nombre_solicitante = ['El nombre del solicitante es obligatorio.'];
        }
        if (!formulario.descripcion.trim()) {
            erroresFormulario.descripcion = ['La descripción es obligatoria.'];
        }
        if (!formulario.monto || Number(formulario.monto) <= 0) {
            erroresFormulario.monto = ['Ingresa un monto válido.'];
        }
        if (!formulario.proveedor_id) {
            erroresFormulario.proveedor_id = ['Selecciona un proveedor.'];
        }
        if (!formulario.fecha_solicitud) {
            erroresFormulario.fecha_solicitud = ['La fecha de solicitud es obligatoria.'];
        }

        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de guardar la cotización.' });
            return;
        }

        setConfirmacion({ cotizacion: editor, accion: 'guardar' });
    };

    const construirFormData = (datos) => {
        const formData = new FormData();
        formData.append('nombre_solicitante', datos.nombre_solicitante || '');
        formData.append('descripcion', datos.descripcion || '');
        formData.append('monto', datos.monto || '');
        formData.append('proveedor_id', datos.proveedor_id || '');
        formData.append('fecha_solicitud', datos.fecha_solicitud || '');
        if (datos.fecha_entrega) {
            formData.append('fecha_entrega', datos.fecha_entrega);
        }
        formData.append('estatus', datos.estatus ? '1' : '0');

        if (datos.cotizacion instanceof File) {
            formData.append('archivo_cotizacion', datos.cotizacion, datos.cotizacion.name);
            formData.append('cotizacion', datos.cotizacion, datos.cotizacion.name);
            formData.append('cotizacion_nombre_original', datos.cotizacion.name);
            formData.append('nombre_original_cotizacion', datos.cotizacion.name);
            formData.append('nombre_archivo_cotizacion', datos.cotizacion.name);
        }
        if (datos.facturas instanceof File) {
            formData.append('archivo_factura', datos.facturas, datos.facturas.name);
            formData.append('facturas', datos.facturas, datos.facturas.name);
            formData.append('facturas_nombre_original', datos.facturas.name);
            formData.append('factura_nombre_original', datos.facturas.name);
            formData.append('nombre_original_factura', datos.facturas.name);
            formData.append('nombre_archivo_facturas', datos.facturas.name);
        }

        return formData;
    };

    const guardarCambios = async () => {
        setGuardando(true);
        setErrores({});
        setMensaje(null);
        try {
            const formData = construirFormData(formulario);
            let respuesta;

            if (editor?.id) {
                respuesta = await actualizarCotizacion(editor.id, formData);
            } else {
                respuesta = await crearCotizacion(formData);
            }

            setMensaje({ color: 'success', texto: respuesta.message ?? 'Cotización guardada correctamente.' });
            setEditor(null);
            setRevision((valor) => valor + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible guardar la cotización.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    const solicitarEliminacion = (itemCotizacion) => {
        if (permisos.eliminar) setConfirmacion({ cotizacion: itemCotizacion, accion: 'eliminar' });
    };

    const ejecutarConfirmacion = async () => {
        if (!confirmacion || guardando) return;
        if (confirmacion.accion === 'guardar') {
            setConfirmacion(null);
            void guardarCambios();
            return;
        }
        if (!permisos.eliminar) return;
        setGuardando(true);
        setMensaje(null);
        try {
            const respuesta = await eliminarCotizacion(confirmacion.cotizacion.id);
            setMensaje({ color: 'success', texto: respuesta.message ?? 'Cotización eliminada correctamente.' });
            setConfirmacion(null);
            setRevision((valor) => valor + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible eliminar la cotización.' });
            }
        } finally {
            setGuardando(false);
        }
    };

const verArchivo = async (itemCotizacion, tipo) => {
        if (!itemCotizacion?.id) return;

        setDescargando(true);
        setMensaje(null);
        try {
            const respuesta = await descargarArchivoCotizacion(itemCotizacion.id, tipo);

            let nombreArchivo = obtenerNombreArchivo(itemCotizacion, tipo);
            const disposition = respuesta.headers?.['content-disposition'];
            if (disposition && disposition.includes('filename=')) {
                const coincidencia = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (coincidencia && coincidencia[1]) {
                    nombreArchivo = coincidencia[1].replace(/['"]/g, '');
                }
            }

            // Detectar el tipo de contenido desde la cabecera
            let tipoContenido = respuesta.headers?.['content-type'];
            
            // Si el backend no envía el tipo, o envía un tipo genérico de descarga, forzamos el correcto según la extensión
            if (!tipoContenido || tipoContenido.includes('application/octet-stream') || tipoContenido.includes('application/x-download')) {
                const extension = nombreArchivo.split('.').pop().toLowerCase();
                const mimeTypes = {
                    'pdf': 'application/pdf',
                    'png': 'image/png',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'xml': 'application/xml',
                    'txt': 'text/plain'
                };
                // Usar el tipo de la extensión encontrada, si no, se queda por defecto en pdf.
                tipoContenido = mimeTypes[extension] || 'application/pdf';
            }

            const blobUrl = window.URL.createObjectURL(new Blob([respuesta.data], { type: tipoContenido }));

            const ventana = window.open(blobUrl, '_blank');
            
            if (!ventana) {
                const enlace = document.createElement('a');
                enlace.href = blobUrl;
                enlace.download = nombreArchivo;
                document.body.appendChild(enlace);
                enlace.click();
                enlace.remove();
            }

            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000); 

        } catch (error) {
            if (!manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: 'No se pudo abrir el archivo. Verifique sus permisos o la sesión.' });
            }
        } finally {
            setDescargando(false);
        }
    };
    const obtenerNombreArchivo = (itemCotizacion, tipo) => {
        if (!itemCotizacion) return 'Documento';

        if (tipo === 'cotizacion') {
            if (itemCotizacion.cotizacion_nombre_original) return itemCotizacion.cotizacion_nombre_original;
            if (itemCotizacion.nombre_original_cotizacion) return itemCotizacion.nombre_original_cotizacion;
            if (itemCotizacion.nombre_archivo_cotizacion) return itemCotizacion.nombre_archivo_cotizacion;
            if (itemCotizacion.cotizacion_nombre) return itemCotizacion.cotizacion_nombre;
            if (itemCotizacion.nombre_original) return itemCotizacion.nombre_original;

            const ruta =
                itemCotizacion.archivo_cotizacion ||
                itemCotizacion.cotizacion ||
                itemCotizacion.cotizacion_url ||
                itemCotizacion.cotizacion_archivo;
            if (ruta && typeof ruta === 'string') return ruta.split('/').pop();
        }

        if (tipo === 'facturas' || tipo === 'factura') {
            if (itemCotizacion.facturas_nombre_original) return itemCotizacion.facturas_nombre_original;
            if (itemCotizacion.factura_nombre_original) return itemCotizacion.factura_nombre_original;
            if (itemCotizacion.nombre_original_factura) return itemCotizacion.nombre_original_factura;
            if (itemCotizacion.nombre_archivo_facturas) return itemCotizacion.nombre_archivo_facturas;
            if (itemCotizacion.factura_nombre) return itemCotizacion.factura_nombre;

            const ruta =
                itemCotizacion.archivo_factura ||
                itemCotizacion.facturas ||
                itemCotizacion.factura ||
                itemCotizacion.factura_url;
            if (ruta && typeof ruta === 'string') return ruta.split('/').pop();
        }

        return 'Documento';
    };

    const formatearMoneda = (monto) => {
        const valor = Number(monto) || 0;
        return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    };

    const errorDe = (campo) => errores[campo]?.[0];
    const hayAcciones = permisos.editar || permisos.eliminar;

    return (
        <CCard className="catalog-card catalog-view">
            <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Cotizaciones</strong>
                    <div className="small text-body-secondary">Consulta y administra las cotizaciones de solicitudes en el sistema</div>
                </div>
                <div className="d-flex gap-2">
                    <CButton color="light" className="border" title="Actualizar registros" aria-label="Actualizar registros" onClick={() => setRevision((valor) => valor + 1)}>
                        <CIcon icon={cilReload} />
                    </CButton>
                </div>
            </CCardHeader>
            <CCardBody>
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                <CRow className="g-2 mb-3">
                    <CCol md={12}>
                        <CInputGroup>
                            <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                            <CFormInput
                                type="search"
                                name="buscar"
                                value={filtros.buscar}
                                onChange={cambiarFiltro}
                                placeholder="Buscar por solicitante, descripción o proveedor..."
                                aria-label="Buscar cotizaciones"
                            />
                        </CInputGroup>
                    </CCol>
                </CRow>
                {cargando ? (
                    <div className="p-4 text-center"><CSpinner /></div>
                ) : (
                    <>
                        <CTable responsive hover align="middle">
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Solicitante</CTableHeaderCell>
                                    <CTableHeaderCell>Descripción</CTableHeaderCell>
                                    <CTableHeaderCell>Proveedor</CTableHeaderCell>
                                    <CTableHeaderCell>Monto</CTableHeaderCell>
                                    <CTableHeaderCell>Fecha Solicitud</CTableHeaderCell>
                                    <CTableHeaderCell>Fecha Entrega</CTableHeaderCell>
                                    <CTableHeaderCell>Cotización</CTableHeaderCell>
                                    <CTableHeaderCell>Factura</CTableHeaderCell>
                                    <CTableHeaderCell className="catalog-status-cell">Estatus</CTableHeaderCell>
                                    {hayAcciones && <CTableHeaderCell className="catalog-actions-cell">Acciones</CTableHeaderCell>}
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {listado.data.map((cotizacionItem) => {
                                    const tieneCotizacion = Boolean(
                                        cotizacionItem.archivo_cotizacion ||
                                        cotizacionItem.cotizacion ||
                                        cotizacionItem.cotizacion_url ||
                                        cotizacionItem.cotizacion_archivo
                                    );
                                    const tieneFactura = Boolean(
                                        cotizacionItem.archivo_factura ||
                                        cotizacionItem.facturas ||
                                        cotizacionItem.factura ||
                                        cotizacionItem.factura_url
                                    );

                                    return (
                                        <CTableRow key={cotizacionItem.id}>
                                            <CTableDataCell className="fw-semibold">
                                                {cotizacionItem.nombre_solicitante}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div className="text-truncate" style={{ maxWidth: '200px' }} title={cotizacionItem.descripcion}>
                                                    {cotizacionItem.descripcion || '—'}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>{cotizacionItem.proveedor?.nombre_proveedor || '—'}</CTableDataCell>
                                            <CTableDataCell className="fw-bold">{formatearMoneda(cotizacionItem.monto)}</CTableDataCell>
                                            <CTableDataCell>{formatearFecha(cotizacionItem.fecha_solicitud)}</CTableDataCell>
                                            <CTableDataCell>{formatearFecha(cotizacionItem.fecha_entrega)}</CTableDataCell>

                                            {/* Columna Cotización */}
                                            <CTableDataCell>
                                                {tieneCotizacion ? (
                                                    <CButton
                                                        color="info"
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={descargando}
                                                        onClick={() => verArchivo(cotizacionItem, 'cotizacion')}
                                                        className="p-0 text-decoration-none"
                                                        title={obtenerNombreArchivo(cotizacionItem, 'cotizacion')}
                                                    >
                                                        <CBadge color="info" className="d-inline-flex align-items-center gap-1 cursor-pointer">
                                                            <CIcon icon={cilPaperclip} size="sm" />
                                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                {obtenerNombreArchivo(cotizacionItem, 'cotizacion')}
                                                            </span>
                                                        </CBadge>
                                                    </CButton>
                                                ) : (
                                                    <span className="text-body-secondary small">Sin archivo</span>
                                                )}
                                            </CTableDataCell>

                                            {/* Columna Facturas */}
                                            <CTableDataCell>
                                                {tieneFactura ? (
                                                    <CButton
                                                        color="info"
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={descargando}
                                                        onClick={() => verArchivo(cotizacionItem, 'facturas')}
                                                        className="p-0 text-decoration-none"
                                                        title={obtenerNombreArchivo(cotizacionItem, 'facturas')}
                                                    >
                                                        <CBadge color="info" className="d-inline-flex align-items-center gap-1 cursor-pointer">
                                                            <CIcon icon={cilPaperclip} size="sm" />
                                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                {obtenerNombreArchivo(cotizacionItem, 'facturas')}
                                                            </span>
                                                        </CBadge>
                                                    </CButton>
                                                ) : (
                                                    <span className="text-body-secondary small">Sin archivo</span>
                                                )}
                                            </CTableDataCell>

                                            <CTableDataCell className="catalog-status-cell">
                                                <StatusBadge active={Boolean(cotizacionItem.estatus)} />
                                            </CTableDataCell>

                                            {hayAcciones && (
                                                <CTableDataCell className="catalog-actions-cell">
                                                    <div className="catalog-actions">
                                                        {permisos.editar && (
                                                            <CButton
                                                                size="sm"
                                                                color="primary"
                                                                variant="ghost"
                                                                className="catalog-action-button"
                                                                title="Editar cotización"
                                                                aria-label="Editar cotización"
                                                                onClick={() => abrirEditor(cotizacionItem)}
                                                                disabled={guardando}
                                                            >
                                                                <CIcon icon={cilPencil} />
                                                            </CButton>
                                                        )}
                                                        {permisos.eliminar && (
                                                            <CButton
                                                                size="sm"
                                                                color="danger"
                                                                variant="ghost"
                                                                className="catalog-action-button"
                                                                title="Eliminar cotización"
                                                                aria-label="Eliminar cotización"
                                                                onClick={() => solicitarEliminacion(cotizacionItem)}
                                                                disabled={guardando}
                                                            >
                                                                <CIcon icon={cilTrash} />
                                                            </CButton>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                            )}
                                        </CTableRow>
                                    );
                                })}
                                {!listado.data.length && (
                                    <CTableRow>
                                        <CTableDataCell colSpan={hayAcciones ? 10 : 9} className="text-center text-body-secondary py-4">
                                            No hay cotizaciones que coincidan con los filtros.
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                            <span className="small text-body-secondary">{listado.total} cotizaciones registradas</span>
                            {listado.last_page > 1 && (
                                <CPagination size="sm" aria-label="Paginación de cotizaciones">
                                    <CPaginationItem
                                        disabled={filtros.page <= 1}
                                        onClick={() => setFiltros((actual) => ({ ...actual, page: actual.page - 1 }))}
                                    >
                                        Anterior
                                    </CPaginationItem>
                                    <CPaginationItem
                                        disabled={filtros.page >= listado.last_page}
                                        onClick={() => setFiltros((actual) => ({ ...actual, page: actual.page + 1 }))}
                                    >
                                        Siguiente
                                    </CPaginationItem>
                                </CPagination>
                            )}
                        </div>
                    </>
                )}
            </CCardBody>

            {/* Modal de formulario (Editar) */}
            <CModal visible={editor !== null} backdrop="static" onClose={() => !guardando && setEditor(null)}>
                <CForm onSubmit={solicitarGuardado} noValidate>
                    <CModalHeader closeButton={!guardando}>
                        <CModalTitle>{editor?.id ? 'Editar cotización' : 'Nueva cotización'}</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        {mensaje?.color === 'danger' && <CAlert color="danger">{mensaje.texto}</CAlert>}
                        <CRow className="g-3">
                            <CCol md={6}>
                                <CFormLabel htmlFor="nombre-solicitante">Solicitante <span className="text-danger">*</span></CFormLabel>
                                <CFormInput id="nombre-solicitante" name="nombre_solicitante" value={formulario.nombre_solicitante} onChange={cambiarCampo} maxLength={150} required invalid={Boolean(errorDe('nombre_solicitante'))} disabled={guardando} />
                                {errorDe('nombre_solicitante') && <div className="invalid-feedback d-block">{errorDe('nombre_solicitante')}</div>}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="proveedor-id">Proveedor <span className="text-danger">*</span></CFormLabel>
                                <CFormSelect id="proveedor-id" name="proveedor_id" value={formulario.proveedor_id} onChange={cambiarCampo} required invalid={Boolean(errorDe('proveedor_id'))} disabled={guardando}>
                                    <option value="">-- Selecciona un proveedor --</option>
                                    {proveedores.map((proveedor) => (
                                        <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre_proveedor}</option>
                                    ))}
                                </CFormSelect>
                                {errorDe('proveedor_id') && <div className="invalid-feedback d-block">{errorDe('proveedor_id')}</div>}
                            </CCol>
                            <CCol md={4}>
                                <CFormLabel htmlFor="monto-cotizacion">Monto ($) <span className="text-danger">*</span></CFormLabel>
                                <CFormInput id="monto-cotizacion" name="monto" type="number" step="0.01" value={formulario.monto} onChange={cambiarCampo} required invalid={Boolean(errorDe('monto'))} disabled={guardando} />
                                {errorDe('monto') && <div className="invalid-feedback d-block">{errorDe('monto')}</div>}
                            </CCol>
                            <CCol md={4}>
                                <CFormLabel htmlFor="fecha-solicitud">Fecha Solicitud <span className="text-danger">*</span></CFormLabel>
                                <CFormInput id="fecha-solicitud" name="fecha_solicitud" type="date" value={formulario.fecha_solicitud} onChange={cambiarCampo} required invalid={Boolean(errorDe('fecha_solicitud'))} disabled={guardando} />
                                {errorDe('fecha_solicitud') && <div className="invalid-feedback d-block">{errorDe('fecha_solicitud')}</div>}
                            </CCol>
                            <CCol md={4}>
                                <CFormLabel htmlFor="fecha-entrega">Fecha Entrega</CFormLabel>
                                <CFormInput id="fecha-entrega" name="fecha_entrega" type="date" value={formulario.fecha_entrega} onChange={cambiarCampo} disabled={guardando} />
                            </CCol>
                            <CCol md={12}>
                                <CFormLabel htmlFor="descripcion">Descripción <span className="text-danger">*</span></CFormLabel>
                                <CFormTextarea id="descripcion" name="descripcion" rows={3} value={formulario.descripcion} onChange={cambiarCampo} required invalid={Boolean(errorDe('descripcion'))} disabled={guardando} />
                                {errorDe('descripcion') && <div className="invalid-feedback d-block">{errorDe('descripcion')}</div>}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="archivo-cotizacion">Archivo Cotización</CFormLabel>
                                <CFormInput
                                    id="archivo-cotizacion"
                                    name="cotizacion"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                    onChange={cambiarArchivo}
                                    invalid={Boolean(errorDe('cotizacion') || errorDe('archivo_cotizacion'))}
                                    disabled={guardando}
                                />
                                {formulario.cotizacion && (
                                    <div className="small text-success mt-1">
                                        Seleccionado: <strong>{formulario.cotizacion.name}</strong>
                                    </div>
                                )}
                                {!formulario.cotizacion && editor && (
                                    <div className="small text-body-secondary mt-1">
                                        Actual: {obtenerNombreArchivo(editor, 'cotizacion')}
                                    </div>
                                )}
                                {(errorDe('cotizacion') || errorDe('archivo_cotizacion')) && (
                                    <div className="invalid-feedback d-block">{errorDe('cotizacion') || errorDe('archivo_cotizacion')}</div>
                                )}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="archivo-facturas">Archivo Factura</CFormLabel>
                                <CFormInput
                                    id="archivo-facturas"
                                    name="facturas"
                                    type="file"
                                    accept=".pdf,.xml,.png,.jpg,.jpeg"
                                    onChange={cambiarArchivo}
                                    invalid={Boolean(errorDe('facturas') || errorDe('archivo_factura'))}
                                    disabled={guardando}
                                />
                                {formulario.facturas && (
                                    <div className="small text-success mt-1">
                                        Seleccionado: <strong>{formulario.facturas.name}</strong>
                                    </div>
                                )}
                                {!formulario.facturas && editor && (
                                    <div className="small text-body-secondary mt-1">
                                        Actual: {obtenerNombreArchivo(editor, 'facturas')}
                                    </div>
                                )}
                                {(errorDe('facturas') || errorDe('archivo_factura')) && (
                                    <div className="invalid-feedback d-block">{errorDe('facturas') || errorDe('archivo_factura')}</div>
                                )}
                            </CCol>
                        </CRow>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setEditor(null)} disabled={guardando}>
                            Cancelar
                        </CButton>
                        <CButton color="primary" type="submit" disabled={guardando}>
                            {guardando ? <CSpinner size="sm" /> : editor?.id ? 'Actualizar' : 'Guardar'}
                        </CButton>
                    </CModalFooter>
                </CForm>
            </CModal>

            {/* Modal de confirmación */}
            <CModal visible={confirmacion !== null} onClose={() => !guardando && setConfirmacion(null)}>
                <CModalHeader closeButton={!guardando}>
                    <CModalTitle>
                        {confirmacion?.accion === 'eliminar' ? 'Confirmar eliminación' : 'Confirmar guardado'}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {confirmacion?.accion === 'eliminar'
                        ? '¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer.'
                        : '¿Deseas guardar los cambios en esta cotización?'}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setConfirmacion(null)} disabled={guardando}>
                        Cancelar
                    </CButton>
                    <CButton
                        color={confirmacion?.accion === 'eliminar' ? 'danger' : 'primary'}
                        onClick={ejecutarConfirmacion}
                        disabled={guardando}
                    >
                        {guardando ? <CSpinner size="sm" /> : confirmacion?.accion === 'eliminar' ? 'Eliminar' : 'Guardar'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    );
}

export default Cotizaciones;
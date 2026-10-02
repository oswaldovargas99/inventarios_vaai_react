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
    actualizarProveedor,
    descargarConstanciaProveedor,
    eliminarProveedor,
    listarProveedores,
} from '../../services/proveedorService';

const filtrosIniciales = { buscar: '', page: 1 };

const formularioInicial = {
    nombre_proveedor: '',
    razon_social: '',
    correo: '',
    telefono: '',
    direccion: '',
    activo: true,
    constancia_sat: null,
};

function Proveedores() {
    const permisos = usePermisos('proveedores');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;

    const [listado, setListado] = useState({ data: [], total: 0, last_page: 1, current_page: 1 });
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
        listarProveedores(filtros, controller.signal)
            .then((respuesta) => {
                if (!controller.signal.aborted) setListado(respuesta.data ?? respuesta);
            })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar los proveedores.' });
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargando(false);
            });
        return () => controller.abort();
    }, [filtros, revision]);

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
        const archivo = event.target.files?.[0] ?? null;
        setFormulario((actual) => ({ ...actual, constancia_sat: archivo }));
        if (errores.constancia_sat) setErrores((actual) => ({ ...actual, constancia_sat: undefined }));
    };

    const abrirEditor = (proveedor) => {
        if (!permisos.editar) return;
        setEditor(proveedor);
        setFormulario({
            nombre_proveedor: proveedor.nombre_proveedor ?? '',
            razon_social: proveedor.razon_social ?? '',
            correo: proveedor.correo ?? '',
            telefono: proveedor.telefono ?? '',
            direccion: proveedor.direccion ?? '',
            activo: Boolean(proveedor.activo),
            constancia_sat: null,
        });
        setMensaje(null);
        setErrores({});
    };

    const solicitarGuardado = (event) => {
        event.preventDefault();
        if (!editor || !permisos.editar || guardando) return;

        const erroresFormulario = {};
        if (!formulario.nombre_proveedor.trim()) erroresFormulario.nombre_proveedor = ['El nombre del proveedor es obligatorio.'];
        if (!formulario.razon_social.trim()) erroresFormulario.razon_social = ['La razón social es obligatoria.'];
        if (!formulario.correo.trim()) erroresFormulario.correo = ['El correo electrónico es obligatorio.'];
        if (!formulario.telefono.trim()) erroresFormulario.telefono = ['El teléfono es obligatorio.'];
        if (!formulario.direccion.trim()) erroresFormulario.direccion = ['La dirección es obligatoria.'];

        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de guardar el proveedor.' });
            return;
        }

        setConfirmacion({ proveedor: editor, accion: 'guardar' });
    };

    const guardarCambios = async () => {
        setGuardando(true);
        setErrores({});
        setMensaje(null);
        try {
            const respuesta = await actualizarProveedor(editor.id, formulario);
            setMensaje({ color: 'success', texto: respuesta.message });
            setEditor(null);
            setRevision((valor) => valor + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible actualizar el proveedor.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    const solicitarEliminacion = (proveedor) => {
        if (permisos.eliminar) setConfirmacion({ proveedor, accion: 'eliminar' });
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
            const respuesta = await eliminarProveedor(confirmacion.proveedor.id);
            setMensaje({ color: 'success', texto: respuesta.message });
            setConfirmacion(null);
            setRevision((valor) => valor + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible eliminar el proveedor.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    // Abre el archivo usando la función del servicio con credenciales/tokens de sesión
    const verArchivo = async (proveedor) => {
        if (!proveedor?.id) return;

        setDescargando(true);
        setMensaje(null);
        try {
            const respuesta = await descargarConstanciaProveedor(proveedor.id);
            const tipoContenido = respuesta.headers['content-type'] || 'application/pdf';
            const blobUrl = window.URL.createObjectURL(new Blob([respuesta.data], { type: tipoContenido }));
            
            const ventana = window.open(blobUrl, '_blank');
            if (!ventana) {
                // Fallback si el navegador bloquea la ventana emergente
                const enlace = document.createElement('a');
                enlace.href = blobUrl;
                enlace.download = obtenerNombreArchivo(proveedor);
                document.body.appendChild(enlace);
                enlace.click();
                enlace.remove();
            }
        } catch (error) {
            if (!manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: 'No se pudo abrir el archivo. Verifique sus permisos o la sesión.' });
            }
        } finally {
            setDescargando(false);
        }
    };

    // Obtiene el nombre del archivo dando prioridad al nombre original enviado por la API
    const obtenerNombreArchivo = (proveedor) => {
        if (!proveedor) return 'Documento';
        if (proveedor.constancia_sat_nombre_original) {
            return proveedor.constancia_sat_nombre_original;
        }
        if (proveedor.nombre_archivo_original) {
            return proveedor.nombre_archivo_original;
        }
        const ruta = proveedor.constancia_sat || proveedor.constancia_sat_url;
        if (!ruta || typeof ruta !== 'string') return 'Documento';
        return ruta.split('/').pop();
    };

    const errorDe = (campo) => errores[campo]?.[0];
    const hayAcciones = permisos.editar || permisos.eliminar;

    return (
        <CCard className="catalog-card catalog-view">
            <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Proveedores</strong>
                    <div className="small text-body-secondary">Consulta y administra los proveedores registrados en el sistema</div>
                </div>
                <CButton color="light" className="border" title="Actualizar registros" aria-label="Actualizar registros" onClick={() => setRevision((valor) => valor + 1)}>
                    <CIcon icon={cilReload} />
                </CButton>
            </CCardHeader>
            <CCardBody>
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                <CRow className="g-2 mb-3">
                    <CCol md={12}>
                        <CInputGroup>
                            <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                            <CFormInput type="search" name="buscar" value={filtros.buscar} onChange={cambiarFiltro} placeholder="Buscar por nombre, razón social, correo o teléfono..." aria-label="Buscar proveedores" />
                        </CInputGroup>
                    </CCol>
                </CRow>
                {cargando ? <div className="p-4 text-center"><CSpinner /></div> : <>
                    <CTable responsive hover align="middle">
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Proveedor</CTableHeaderCell>
                                <CTableHeaderCell>Razón social</CTableHeaderCell>
                                <CTableHeaderCell>Correo</CTableHeaderCell>
                                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                                <CTableHeaderCell>Constancia SAT</CTableHeaderCell>
                                <CTableHeaderCell className="catalog-status-cell">Estatus</CTableHeaderCell>
                                {hayAcciones && <CTableHeaderCell className="catalog-actions-cell">Acciones</CTableHeaderCell>}
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {listado.data.map((proveedor) => {
                                const tieneArchivo = Boolean(proveedor.constancia_sat || proveedor.constancia_sat_url);

                                return (
                                    <CTableRow key={proveedor.id}>
                                        <CTableDataCell className="fw-semibold">{proveedor.nombre_proveedor}</CTableDataCell>
                                        <CTableDataCell>{proveedor.razon_social || '—'}</CTableDataCell>
                                        <CTableDataCell>{proveedor.correo || '—'}</CTableDataCell>
                                        <CTableDataCell>{proveedor.telefono || '—'}</CTableDataCell>
                                        <CTableDataCell>
                                            {tieneArchivo ? (
                                                <CButton
                                                    color="info"
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled={descargando}
                                                    onClick={() => verArchivo(proveedor)}
                                                    className="p-0 text-decoration-none"
                                                >
                                                    <CBadge color="info" className="d-inline-flex align-items-center gap-1 cursor-pointer">
                                                        <CIcon icon={cilPaperclip} size="sm" />
                                                        <span>{obtenerNombreArchivo(proveedor)}</span>
                                                    </CBadge>
                                                </CButton>
                                            ) : (
                                                <span className="text-body-secondary small">Sin archivo</span>
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell className="catalog-status-cell">
                                            <StatusBadge active={Boolean(proveedor.activo)} />
                                        </CTableDataCell>
                                        {hayAcciones && (
                                            <CTableDataCell className="catalog-actions-cell">
                                                <div className="catalog-actions">
                                                    {permisos.editar && (
                                                        <CButton size="sm" color="primary" variant="ghost" className="catalog-action-button" title="Editar proveedor" aria-label="Editar proveedor" onClick={() => abrirEditor(proveedor)} disabled={guardando}>
                                                            <CIcon icon={cilPencil} />
                                                        </CButton>
                                                    )}
                                                    {permisos.eliminar && (
                                                        <CButton size="sm" color="danger" variant="ghost" className="catalog-action-button" title="Eliminar proveedor" aria-label="Eliminar proveedor" onClick={() => solicitarEliminacion(proveedor)} disabled={guardando}>
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
                                    <CTableDataCell colSpan={hayAcciones ? 7 : 6} className="text-center text-body-secondary py-4">
                                        No hay proveedores que coincidan con los filtros.
                                    </CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>
                    </CTable>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                        <span className="small text-body-secondary">{listado.total} proveedores registrados</span>
                        {listado.last_page > 1 && (
                            <CPagination size="sm" aria-label="Paginación de proveedores">
                                <CPaginationItem disabled={filtros.page <= 1} onClick={() => setFiltros((actual) => ({ ...actual, page: actual.page - 1 }))}>Anterior</CPaginationItem>
                                <CPaginationItem disabled={filtros.page >= listado.last_page} onClick={() => setFiltros((actual) => ({ ...actual, page: actual.page + 1 }))}>Siguiente</CPaginationItem>
                            </CPagination>
                        )}
                    </div>
                </>}
            </CCardBody>

            {/* Modal de edición */}
            <CModal visible={editor !== null} backdrop="static" onClose={() => !guardando && setEditor(null)}>
                <CForm onSubmit={solicitarGuardado} noValidate>
                    <CModalHeader closeButton={!guardando}>
                        <CModalTitle>Editar proveedor</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        {mensaje?.color === 'danger' && <CAlert color="danger">{mensaje.texto}</CAlert>}
                        <CRow className="g-3">
                            <CCol md={6}>
                                <CFormLabel htmlFor="nombre-proveedor">Nombre del proveedor <span className="text-danger">*</span></CFormLabel>
                                <CFormInput id="nombre-proveedor" name="nombre_proveedor" value={formulario.nombre_proveedor} onChange={cambiarCampo} maxLength={150} required invalid={Boolean(errorDe('nombre_proveedor'))} disabled={guardando} />
                                {errorDe('nombre_proveedor') && <div className="invalid-feedback d-block">{errorDe('nombre_proveedor')}</div>}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="razon-social">Razón social <span className="text-danger">*</span></CFormLabel>
                                <CFormInput id="razon-social" name="razon_social" value={formulario.razon_social} onChange={cambiarCampo} maxLength={200} required invalid={Boolean(errorDe('razon_social'))} disabled={guardando} />
                                {errorDe('razon_social') && <div className="invalid-feedback d-block">{errorDe('razon_social')}</div>}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="correo-proveedor">Correo electrónico <span className="text-danger">*</span></CFormLabel>
                                <CFormInput id="correo-proveedor" name="correo" type="email" value={formulario.correo} onChange={cambiarCampo} maxLength={150} required invalid={Boolean(errorDe('correo'))} disabled={guardando} />
                                {errorDe('correo') && <div className="invalid-feedback d-block">{errorDe('correo')}</div>}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="telefono-proveedor">Teléfono <span className="text-danger">*</span></CFormLabel>
                                <CFormInput id="telefono-proveedor" name="telefono" value={formulario.telefono} onChange={cambiarCampo} maxLength={20} required invalid={Boolean(errorDe('telefono'))} disabled={guardando} />
                                {errorDe('telefono') && <div className="invalid-feedback d-block">{errorDe('telefono')}</div>}
                            </CCol>
                            <CCol xs={12}>
                                <CFormLabel htmlFor="direccion-proveedor">Dirección <span className="text-danger">*</span></CFormLabel>
                                <CFormTextarea id="direccion-proveedor" name="direccion" value={formulario.direccion} onChange={cambiarCampo} maxLength={255} rows={3} required invalid={Boolean(errorDe('direccion'))} disabled={guardando} />
                                {errorDe('direccion') && <div className="invalid-feedback d-block">{errorDe('direccion')}</div>}
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="estatus-proveedor">Estatus</CFormLabel>
                                <CFormSelect id="estatus-proveedor" name="activo" value={String(formulario.activo)} onChange={(event) => setFormulario((actual) => ({ ...actual, activo: event.target.value === 'true' }))} disabled={guardando}>
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </CFormSelect>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel htmlFor="constancia-sat">Reemplazar constancia del SAT (opcional)</CFormLabel>
                                
                                {/* Muestra el archivo actual guardado con su nombre original */}
                                {(editor?.constancia_sat || editor?.constancia_sat_url) && (
                                    <div className="small text-body-secondary mb-2">
                                        <strong>Archivo actual:</strong>{' '}
                                        <CButton
                                            color="link"
                                            size="sm"
                                            className="p-0 text-decoration-none"
                                            onClick={() => verArchivo(editor)}
                                            disabled={descargando}
                                        >
                                            <CIcon icon={cilPaperclip} className="me-1" />
                                            {obtenerNombreArchivo(editor)}
                                        </CButton>
                                    </div>
                                )}

                                <CFormInput id="constancia-sat" name="constancia_sat" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={cambiarArchivo} invalid={Boolean(errorDe('constancia_sat'))} disabled={guardando} />
                                {errorDe('constancia_sat') && <div className="invalid-feedback d-block">{errorDe('constancia_sat')}</div>}
                            </CCol>
                        </CRow>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" variant="outline" onClick={() => setEditor(null)} disabled={guardando}>Cancelar</CButton>
                        <CButton color="primary" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</CButton>
                    </CModalFooter>
                </CForm>
            </CModal>

            {/* Modal de confirmación */}
            {hayAcciones && (
                <CModal visible={Boolean(confirmacion)} backdrop="static" onClose={() => !guardando && setConfirmacion(null)}>
                    <CModalHeader closeButton={!guardando}>
                        <CModalTitle>Confirmar operación</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        {confirmacion?.accion === 'eliminar'
                            ? <>¿Deseas eliminar definitivamente al proveedor <strong>{confirmacion.proveedor.nombre_proveedor}</strong>?</>
                            : <>¿Deseas guardar los cambios del proveedor <strong>{confirmacion?.proveedor.nombre_proveedor}</strong>?</>}
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" variant="outline" onClick={() => setConfirmacion(null)} disabled={guardando}>Cancelar</CButton>
                        <CButton color={confirmacion?.accion === 'eliminar' ? 'danger' : 'primary'} onClick={ejecutarConfirmacion} disabled={guardando}>
                            {guardando ? 'Procesando...' : 'Confirmar'}
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}
        </CCard>
    );
}

export default Proveedores;
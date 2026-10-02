import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass, cilPlus, cilReload, cilPencil, cilXCircle, cilCheckCircle, cilTrash } from '@coreui/icons';
import { CatalogHeader, StatusBadge, CatalogLoading, CatalogEmptyState } from '../../components/catalogos/CatalogPresentation';
import {
    CAlert, CButton, CCard, CCardBody, CForm, CFormInput, CInputGroup, CInputGroupText,
    CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader,
    CModalTitle, CPagination, CPaginationItem, CTable, CTableBody,
    CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import { guardarModelo, listarMarcas, listarModelos, modificarModelo } from '../../services/modelos';

const formularioVacio = { marca_id: '', nombre: '', descripcion: '' };

export default function Modelos() {
    const permisos = usePermisos('modelos');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;
    const bloqueo = useRef(false);
    const [marcas, setMarcas] = useState([]);
    const [listado, setListado] = useState({ data: [], total: 0, last_page: 1 });
    const [filtros, setFiltros] = useState({ buscar: '', marca_id: '', estatus: '', page: 1 });
    const [revision, setRevision] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [editor, setEditor] = useState(null);
    const [formulario, setFormulario] = useState(formularioVacio);
    const [errores, setErrores] = useState({});
    const [confirmacion, setConfirmacion] = useState(null);
    const puedeGuardar = editor?.id ? permisos.editar : permisos.crear;
    const hayAcciones = permisos.editar || permisos.cambiarEstatus || permisos.eliminar;

    useEffect(() => {
        const controller = new AbortController();
        setCargando(true);
        const timer = window.setTimeout(async () => {
            try {
                const { data } = await listarModelos(filtros, controller.signal);
                if (controller.signal.aborted) return;
                if (filtros.page > data.data.last_page) {
                    setFiltros((actual) => ({ ...actual, page: data.data.last_page }));
                } else {
                    setListado(data.data);
                }
            } catch (error) {
                if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setListado({ data: [], total: 0, last_page: 1 });
                    setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible cargar los modelos.' });
                }
            } finally {
                if (!controller.signal.aborted) setCargando(false);
            }
        }, 300);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [filtros, revision]);

    useEffect(() => {
        const controller = new AbortController();
        listarMarcas(controller.signal).then((datos) => {
            if (!controller.signal.aborted) setMarcas(datos);
        }).catch((error) => {
            if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: 'No fue posible cargar las marcas. Pulsa Actualizar para reintentar.' });
            }
        });
        return () => controller.abort();
    }, [revision]);

    const abrirEditor = (modelo = {}) => {
        if (!(modelo.id ? permisos.editar : permisos.crear)) return;
        setFormulario(modelo.id ? {
            marca_id: modelo.marca_id, nombre: modelo.nombre, descripcion: modelo.descripcion ?? '',
        } : { ...formularioVacio });
        setErrores({});
        setEditor(modelo);
    };

    const ejecutar = async (operacion) => {
        if (bloqueo.current) return;
        bloqueo.current = true;
        setGuardando(true);
        setErrores({});
        setMensaje(null);
        try {
            const { data } = await operacion();
            setMensaje({ color: 'success', texto: data.message });
            setEditor(null);
            setConfirmacion(null);
            setRevision((valor) => valor + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible completar la operación.' });
            }
        } finally {
            bloqueo.current = false;
            setGuardando(false);
        }
    };

    const cambiarFiltro = (event) => {
        const { name, value } = event.target;
        setFiltros((actual) => ({ ...actual, [name]: value, page: 1 }));
    };
    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) {
            setErrores((actual) => ({ ...actual, [name]: undefined }));
        }
    };

    const guardarFormulario = (event) => {
        event.preventDefault();
        const erroresFormulario = {};
        if (!formulario.marca_id) erroresFormulario.marca_id = ['Selecciona una marca.'];
        if (!formulario.nombre.trim()) erroresFormulario.nombre = ['El nombre del modelo es obligatorio.'];
        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de guardar el modelo.' });
            return;
        }
        if (puedeGuardar) void ejecutar(() => guardarModelo(editor?.id, formulario));
    };

    return (
        <CCard className="catalog-card catalog-view">
            <CatalogHeader title="Modelos" description="Modelos de equipos y sus marcas asociadas.">
                {permisos.crear && <CButton size="sm" className="btn-vaai d-flex align-items-center gap-2" onClick={() => abrirEditor()}><CIcon icon={cilPlus} />Nuevo modelo</CButton>}
            </CatalogHeader>
            <CCardBody className="p-0">
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                <div className="catalog-toolbar">
                    <div className="catalog-metrics mb-2">{listado.total} registros en el catálogo</div>
                    <div className="catalog-filters">
                    <CInputGroup size="sm"><CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText><CFormInput type="search" aria-label="Buscar modelos" placeholder="Buscar modelo, descripción o marca…" name="buscar" value={filtros.buscar} onChange={cambiarFiltro} /></CInputGroup>
                    <CFormSelect aria-label="Filtrar por marca" name="marca_id" value={filtros.marca_id} onChange={cambiarFiltro}>
                        <option value="">Todas las marcas</option>
                        {marcas.map((marca) => <option key={marca.id} value={marca.id}>{marca.nombre}</option>)}
                    </CFormSelect>
                    <CFormSelect aria-label="Filtrar por estatus" name="estatus" value={filtros.estatus} onChange={cambiarFiltro}>
                        <option value="">Todos</option><option value="1">Activos</option><option value="0">Inactivos</option>
                    </CFormSelect>
                    <CButton color="light" className="border" title="Actualizar registros" aria-label="Actualizar registros" onClick={() => setRevision((valor) => valor + 1)}><CIcon icon={cilReload} /></CButton>
                    </div>
                </div>
                {cargando ? <CatalogLoading /> : <>
                    <CTable responsive hover align="middle" className="catalog-table">
                        <CTableHead><CTableRow>
                            {['Nombre', 'Marca', 'Descripción', 'Estatus', ...(hayAcciones ? ['Acciones'] : [])].map((titulo) => <CTableHeaderCell key={titulo} className={titulo === 'Estatus' ? 'catalog-status-cell' : titulo === 'Acciones' ? 'catalog-actions-cell' : undefined}>{titulo}</CTableHeaderCell>)}
                        </CTableRow></CTableHead>
                        <CTableBody>
                            {listado.data.map((modelo) => <CTableRow key={modelo.id}>
                                <CTableDataCell className="catalog-name">{modelo.nombre}</CTableDataCell>
                                <CTableDataCell>{modelo.marca?.nombre}</CTableDataCell>
                                <CTableDataCell><span className="catalog-description">{modelo.descripcion || '—'}</span></CTableDataCell>
                                <CTableDataCell className="catalog-status-cell"><StatusBadge active={modelo.estatus} /></CTableDataCell>
                                {hayAcciones && <CTableDataCell className="catalog-actions-cell"><div className="catalog-actions">
                                    {permisos.editar && <CButton size="sm" color="primary" variant="ghost" className="catalog-action-button" title="Editar" aria-label="Editar" disabled={guardando} onClick={() => abrirEditor(modelo)}><CIcon icon={cilPencil} size="sm" /></CButton>}
                                    {permisos.cambiarEstatus && <CButton size="sm" color="warning" variant="ghost" className="catalog-action-button" title={modelo.estatus ? 'Desactivar' : 'Activar'} aria-label={modelo.estatus ? 'Desactivar' : 'Activar'} disabled={guardando} onClick={() => setConfirmacion({ modelo, accion: 'cambiarEstatus' })}><CIcon icon={modelo.estatus ? cilXCircle : cilCheckCircle} size="sm" /></CButton>}
                                    {permisos.eliminar && <CButton size="sm" color="danger" variant="ghost" className="catalog-action-button" title="Eliminar" aria-label="Eliminar" disabled={guardando} onClick={() => setConfirmacion({ modelo, accion: 'eliminar' })}><CIcon icon={cilTrash} size="sm" /></CButton>}
                                </div></CTableDataCell>}
                            </CTableRow>)}
                            {!listado.data.length && <CTableRow><CTableDataCell colSpan={hayAcciones ? 5 : 4}><CatalogEmptyState filtered={Boolean(filtros.buscar || filtros.marca_id || filtros.estatus)} /></CTableDataCell></CTableRow>}
                        </CTableBody>
                    </CTable>
                    <div className="catalog-pagination d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="catalog-pagination-summary">Mostrando <strong>{listado.from ?? 0}</strong>–<strong>{listado.to ?? 0}</strong> de <strong>{listado.total}</strong> registros.<span className="catalog-page-number">Página {filtros.page} de {listado.last_page}</span></div>
                        <CPagination size="sm" aria-label="Paginación de modelos">
                            <CPaginationItem disabled={filtros.page <= 1} onClick={() => setFiltros((actual) => ({ ...actual, page: Math.max(1, actual.page - 1) }))}>Anterior</CPaginationItem>
                            <CPaginationItem disabled={filtros.page >= listado.last_page} onClick={() => setFiltros((actual) => ({ ...actual, page: Math.min(listado.last_page, actual.page + 1) }))}>Siguiente</CPaginationItem>
                        </CPagination>
                    </div>
                </>}
                {puedeGuardar && <CModal visible={editor !== null} backdrop="static" onClose={() => { if (!guardando) setEditor(null); }}>
                    <CForm onSubmit={guardarFormulario} noValidate>
                        <CModalHeader closeButton={!guardando}><CModalTitle>{editor?.id ? 'Editar modelo' : 'Nuevo modelo'}</CModalTitle></CModalHeader>
                        <CModalBody>
                            {mensaje?.color === 'danger' && <CAlert color="danger">{mensaje.texto}</CAlert>}
                            <CFormLabel htmlFor="modelo-marca">Marca</CFormLabel>
                            <CFormSelect id="modelo-marca" name="marca_id" value={formulario.marca_id} onChange={cambiarCampo} required invalid={Boolean(errores.marca_id)} disabled={guardando}>
                                <option value="">Selecciona una marca activa</option>
                                {marcas.map((marca) => <option key={marca.id} value={marca.id} disabled={!marca.estatus}>{marca.nombre}{!marca.estatus ? ' (inactiva)' : ''}</option>)}
                            </CFormSelect>
                            {errores.marca_id && <div className="invalid-feedback d-block">{errores.marca_id[0]}</div>}
                            <CFormLabel htmlFor="modelo-nombre" className="mt-3">Nombre</CFormLabel>
                            <CFormInput id="modelo-nombre" name="nombre" value={formulario.nombre} onChange={cambiarCampo} maxLength={100} required invalid={Boolean(errores.nombre)} disabled={guardando} />
                            {errores.nombre && <div className="invalid-feedback d-block">{errores.nombre[0]}</div>}
                            <CFormLabel htmlFor="modelo-descripcion" className="mt-3">Descripción</CFormLabel>
                            <CFormInput id="modelo-descripcion" name="descripcion" value={formulario.descripcion} onChange={cambiarCampo} maxLength={255} invalid={Boolean(errores.descripcion)} disabled={guardando} />
                            {errores.descripcion && <div className="invalid-feedback d-block">{errores.descripcion[0]}</div>}
                        </CModalBody>
                        <CModalFooter><CButton color="secondary" disabled={guardando} onClick={() => setEditor(null)}>Cancelar</CButton><CButton type="submit" className="btn-vaai" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</CButton></CModalFooter>
                    </CForm>
                </CModal>}
                <CModal visible={Boolean(confirmacion)} backdrop="static" onClose={() => { if (!guardando) setConfirmacion(null); }}>
                    <CModalHeader closeButton={!guardando}><CModalTitle>Confirmar operación</CModalTitle></CModalHeader>
                    <CModalBody>
                        {mensaje?.color === 'danger' && <CAlert color="danger">{mensaje.texto}</CAlert>}
                        ¿Deseas {confirmacion?.accion === 'eliminar' ? 'eliminar definitivamente' : confirmacion?.modelo.estatus ? 'desactivar' : 'activar'} el modelo <strong>{confirmacion?.modelo.nombre}</strong>?
                    </CModalBody>
                    <CModalFooter><CButton color="secondary" disabled={guardando} onClick={() => setConfirmacion(null)}>Cancelar</CButton><CButton color="danger" disabled={guardando} onClick={() => {
                        if (confirmacion && permisos[confirmacion.accion]) void ejecutar(() => modificarModelo(confirmacion.modelo.id, confirmacion.accion));
                    }}>{guardando ? 'Procesando...' : 'Confirmar'}</CButton></CModalFooter>
                </CModal>
            </CCardBody>
        </CCard>
    );
}

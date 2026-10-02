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
import { cilMagnifyingGlass, cilPencil, cilReload } from '@coreui/icons';
import { EquipmentStatusBadge } from '../../components/catalogos/CatalogPresentation';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import {
    actualizarEquipo,
    listarEquipos,
    listarTiposEquipo,
} from '../../services/equipoService';

const filtrosIniciales = { buscar: '', tipo_equipo_id: '', estatus: '', page: 1 };
function Equipos() {
    const permisos = usePermisos('equipos');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;
    const [listado, setListado] = useState({ data: [], total: 0, last_page: 1, current_page: 1 });
    const [filtros, setFiltros] = useState(filtrosIniciales);
    const [tiposEquipo, setTiposEquipo] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [revision, setRevision] = useState(0);
    const [mensaje, setMensaje] = useState(null);
    const [editor, setEditor] = useState(null);
    const [errores, setErrores] = useState({});
    const [formulario, setFormulario] = useState({ estatus: 'activo', observaciones: '' });

    useEffect(() => {
        const controller = new AbortController();
        setCargando(true);
        listarEquipos(filtros, controller.signal)
            .then((respuesta) => {
                if (!controller.signal.aborted) setListado(respuesta);
            })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar los equipos.' });
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargando(false);
            });
        return () => controller.abort();
    }, [filtros, revision]);

    useEffect(() => {
        const controller = new AbortController();
        listarTiposEquipo(controller.signal)
            .then((datos) => {
                if (!controller.signal.aborted) setTiposEquipo(datos ?? []);
            })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar los tipos de equipo.' });
                }
            });
        return () => controller.abort();
    }, []);

    const cambiarFiltro = (event) => {
        const { name, value } = event.target;
        setFiltros((actual) => ({ ...actual, [name]: value, page: 1 }));
    };

    const abrirEditor = (equipo) => {
        if (!permisos.editar && !permisos.cambiarEstatus) return;
        setEditor(equipo);
        setFormulario({ estatus: equipo.estatus, observaciones: equipo.observaciones ?? '' });
        setMensaje(null);
        setErrores({});
    };

    const guardarCambios = async (event) => {
        event.preventDefault();
        if (!editor || (!permisos.editar && !permisos.cambiarEstatus)) return;

        if (!formulario.estatus) {
            setErrores({ estatus: ['Selecciona un estatus para el equipo.'] });
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de guardar los cambios.' });
            return;
        }

        setGuardando(true);
        setErrores({});
        try {
            const respuesta = await actualizarEquipo(editor.id, {
                estatus: formulario.estatus,
                observaciones: formulario.observaciones.trim() || null,
            });
            setMensaje({ color: 'success', texto: respuesta.message });
            setEditor(null);
            setRevision((valor) => valor + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible actualizar el equipo.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    return (
        <CCard className="catalog-card catalog-view">
            <CCardHeader className="d-flex justify-content-between align-items-center">
                <div><strong>Equipos</strong><div className="small text-body-secondary">Equipos dados de alta en el inventario</div></div>
                <CButton color="light" className="border" title="Actualizar registros" aria-label="Actualizar registros" onClick={() => setRevision((valor) => valor + 1)}><CIcon icon={cilReload} /></CButton>
            </CCardHeader>
            <CCardBody>
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                <CRow className="g-2 mb-3">
                    <CCol md={5}><CInputGroup><CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText><CFormInput type="search" name="buscar" value={filtros.buscar} onChange={cambiarFiltro} placeholder="Buscar por ID, serie o tipo" aria-label="Buscar equipos" /></CInputGroup></CCol>
                    <CCol md={3}><CFormSelect name="tipo_equipo_id" value={filtros.tipo_equipo_id} onChange={cambiarFiltro} aria-label="Filtrar por tipo"><option value="">Todos los tipos</option>{tiposEquipo.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}</CFormSelect></CCol>
                    <CCol md={3}><CFormSelect name="estatus" value={filtros.estatus} onChange={cambiarFiltro} aria-label="Filtrar por estatus"><option value="">Todos los estatus</option><option value="activo">Activo</option><option value="no_activo">No activo</option><option value="para_baja">Para baja</option></CFormSelect></CCol>
                </CRow>
                {cargando ? <div className="p-4 text-center"><CSpinner /></div> : <>
                    <CTable responsive hover align="middle">
                        <CTableHead><CTableRow><CTableHeaderCell>ID</CTableHeaderCell><CTableHeaderCell>Número de serie</CTableHeaderCell><CTableHeaderCell>Tipo de equipo</CTableHeaderCell><CTableHeaderCell>Modelo</CTableHeaderCell><CTableHeaderCell>Estatus</CTableHeaderCell><CTableHeaderCell>Observaciones</CTableHeaderCell><CTableHeaderCell>Acciones</CTableHeaderCell></CTableRow></CTableHead>
                        <CTableBody>
                            {listado.data.map((equipo) => <CTableRow key={equipo.id}><CTableDataCell>{equipo.id_equipo}</CTableDataCell><CTableDataCell>{equipo.numero_serie}</CTableDataCell><CTableDataCell>{equipo.tipo_equipo?.nombre ?? '—'}</CTableDataCell><CTableDataCell>{equipo.modelo?.nombre ?? '—'}</CTableDataCell><CTableDataCell><EquipmentStatusBadge status={equipo.estatus} /></CTableDataCell><CTableDataCell><span className="catalog-description">{equipo.observaciones || '—'}</span></CTableDataCell><CTableDataCell><CButton size="sm" color="primary" variant="ghost" title="Agregar observaciones o cambiar estatus" aria-label="Agregar observaciones o cambiar estatus" onClick={() => abrirEditor(equipo)} disabled={!permisos.editar && !permisos.cambiarEstatus}><CIcon icon={cilPencil} /></CButton></CTableDataCell></CTableRow>)}
                            {!listado.data.length && <CTableRow><CTableDataCell colSpan={7} className="text-center text-body-secondary">No hay equipos que coincidan con los filtros.</CTableDataCell></CTableRow>}
                        </CTableBody>
                    </CTable>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2"><span className="small text-body-secondary">{listado.total} equipos registrados</span><CPagination size="sm" aria-label="Paginación de equipos"><CPaginationItem disabled={filtros.page <= 1} onClick={() => setFiltros((actual) => ({ ...actual, page: actual.page - 1 }))}>Anterior</CPaginationItem><CPaginationItem disabled={filtros.page >= listado.last_page} onClick={() => setFiltros((actual) => ({ ...actual, page: actual.page + 1 }))}>Siguiente</CPaginationItem></CPagination></div>
                </>}
            </CCardBody>
            <CModal visible={editor !== null} backdrop="static" onClose={() => !guardando && setEditor(null)}>
                <CForm onSubmit={guardarCambios} noValidate><CModalHeader closeButton={!guardando}><CModalTitle>Actualizar equipo</CModalTitle></CModalHeader><CModalBody>
                    {editor && <p className="small text-body-secondary mb-3">{editor.id_equipo} · {editor.numero_serie}</p>}
                    <CFormLabel htmlFor="estatus-equipo">Estatus</CFormLabel><CFormSelect id="estatus-equipo" value={formulario.estatus} required invalid={Boolean(errores.estatus)} onChange={(event) => setFormulario((actual) => ({ ...actual, estatus: event.target.value }))} disabled={!permisos.cambiarEstatus || guardando}><option value="">Selecciona un estatus</option><option value="activo">Activo</option><option value="no_activo">No activo</option><option value="para_baja">Para baja</option></CFormSelect>
                    {errores.estatus?.[0] && <div className="invalid-feedback d-block">{errores.estatus[0]}</div>}
                    <CFormLabel htmlFor="observaciones-equipo" className="mt-3">Observaciones</CFormLabel><CFormTextarea id="observaciones-equipo" value={formulario.observaciones} onChange={(event) => setFormulario((actual) => ({ ...actual, observaciones: event.target.value }))} maxLength={2000} rows={5} disabled={!permisos.editar || guardando} />
                </CModalBody><CModalFooter><CButton color="secondary" variant="outline" onClick={() => setEditor(null)} disabled={guardando}>Cancelar</CButton><CButton color="primary" type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</CButton></CModalFooter></CForm>
            </CModal>
        </CCard>
    );
}

export default Equipos;
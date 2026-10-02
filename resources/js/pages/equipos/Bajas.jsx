import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CSpinner,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash } from '@coreui/icons';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import { eliminarEquipo, listarEquipos } from '../../services/equipoService';
import { EquipmentStatusBadge } from '../../components/catalogos/CatalogPresentation';

function Bajas() {
    const permisos = usePermisos('equipos');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;
    const [equipos, setEquipos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [confirmacion, setConfirmacion] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const cargarBajas = (signal) => {
        setCargando(true);
        listarEquipos({ estatus: 'para_baja' }, signal)
            .then((respuesta) => {
                if (!signal.aborted) setEquipos(respuesta.data ?? []);
            })
            .catch((error) => {
                if (!signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar las bajas.' });
                }
            })
            .finally(() => {
                if (!signal.aborted) setCargando(false);
            });
    };

    useEffect(() => {
        const controller = new AbortController();
        cargarBajas(controller.signal);
        return () => controller.abort();
    }, []);

    const darDeBaja = async () => {
        if (!confirmacion || !permisos.eliminar || guardando) return;
        setGuardando(true);
        try {
            const respuesta = await eliminarEquipo(confirmacion.id);
            setMensaje({ color: 'success', texto: respuesta.message });
            setEquipos((actuales) => actuales.filter((equipo) => equipo.id !== confirmacion.id));
            setConfirmacion(null);
        } catch (error) {
            if (!manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible eliminar el equipo.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    return (
        <CCard className="catalog-view">
            <CCardHeader><strong>Bajas de equipos</strong><div className="small text-body-secondary">Equipos marcados para baja</div></CCardHeader>
            <CCardBody className="p-0">
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                {cargando ? <div className="p-4 text-center"><CSpinner /></div> : <CTable responsive hover align="middle" className="mb-0">
                    <CTableHead><CTableRow><CTableHeaderCell>ID</CTableHeaderCell><CTableHeaderCell>Número de serie</CTableHeaderCell><CTableHeaderCell>Tipo de equipo</CTableHeaderCell><CTableHeaderCell>Estatus</CTableHeaderCell><CTableHeaderCell>Acciones</CTableHeaderCell></CTableRow></CTableHead>
                    <CTableBody>
                        {equipos.map((equipo) => <CTableRow key={equipo.id}><CTableDataCell>{equipo.id_equipo}</CTableDataCell><CTableDataCell>{equipo.numero_serie}</CTableDataCell><CTableDataCell>{equipo.tipo_equipo?.nombre ?? '—'}</CTableDataCell><CTableDataCell><EquipmentStatusBadge status={equipo.estatus} /></CTableDataCell><CTableDataCell><CButton size="sm" color="danger" variant="ghost" title="Eliminar equipo" aria-label="Eliminar equipo" onClick={() => setConfirmacion(equipo)}><CIcon icon={cilTrash} /></CButton></CTableDataCell></CTableRow>)}
                        {!equipos.length && <CTableRow><CTableDataCell colSpan={5} className="text-center text-body-secondary">No hay equipos marcados para baja.</CTableDataCell></CTableRow>}
                    </CTableBody>
                </CTable>}
            </CCardBody>
            <CModal visible={confirmacion !== null} onClose={() => !guardando && setConfirmacion(null)}>
                <CModalHeader closeButton={!guardando}><CModalTitle>Confirmar baja</CModalTitle></CModalHeader>
                <CModalBody>¿Deseas eliminar el equipo <strong>{confirmacion?.id_equipo}</strong> de la lista?</CModalBody>
                <CModalFooter><CButton color="secondary" variant="outline" onClick={() => setConfirmacion(null)} disabled={guardando}>Cancelar</CButton><CButton color="danger" onClick={darDeBaja} disabled={guardando}>{guardando ? 'Eliminando...' : 'Eliminar equipo'}</CButton></CModalFooter>
            </CModal>
        </CCard>
    );
}

export default Bajas;
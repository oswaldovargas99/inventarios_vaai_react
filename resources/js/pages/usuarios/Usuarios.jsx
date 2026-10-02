import React, { useEffect, useRef, useState } from 'react';
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CFormInput,
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
import { cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons';
import axios from 'axios';
import { StatusBadge } from '../../components/catalogos/CatalogPresentation';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import { actualizarUsuario, eliminarUsuario, listarUsuarios } from '../../services/usuarios';

const roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Patrimonio' },
    { id: 3, nombre: 'Secretario' },
    { id: 4, nombre: 'Usuario' },
];

const mensajesObligatorios = {
    codigo: 'El código es obligatorio.',
    nombre: 'El nombre es obligatorio.',
    email: 'El correo electrónico es obligatorio.',
    rol_id: 'El rol es obligatorio.',
};

const camposFormulario = [
    ['codigo', 'Código', true],
    ['nombre', 'Nombre', true],
    ['apellido_paterno', 'Apellido paterno', false],
    ['apellido_materno', 'Apellido materno', false],
    ['email', 'Correo electrónico', true],
    ['id_centro_universitario', 'Centro universitario', false],
];

function Usuarios() {
    const permisos = usePermisos('usuarios');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;
    const [listado, setListado] = useState({ data: [], total: 0, current_page: 1, last_page: 1 });
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(1);
    const [recarga, setRecarga] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [usuarioEditado, setUsuarioEditado] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        const controller = new AbortController();
        setCargando(true);
        listarUsuarios({ buscar: busqueda || undefined, page: pagina }, controller.signal)
            .then((respuesta) => { if (!controller.signal.aborted) setListado(respuesta.data); })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar los usuarios.' });
                }
            })
            .finally(() => { if (!controller.signal.aborted) setCargando(false); });
        return () => controller.abort();
    }, [busqueda, pagina, recarga]);

    const abrirEdicion = (usuario) => {
        setErrores({});
        setMensaje(null);
        setUsuarioEditado({
            ...usuario,
            apellido_paterno: usuario.apellido_paterno ?? '',
            apellido_materno: usuario.apellido_materno ?? '',
            email: usuario.email ?? usuario.correo ?? '',
            rol_id: usuario.rol_id ?? usuario.rol?.id,
            id_centro_universitario: usuario.id_centro_universitario ?? '',
            password: '',
            password_confirmation: '',
        });
    };

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        setUsuarioEditado((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) setErrores((actual) => ({ ...actual, [name]: undefined }));
    };

    const solicitarGuardado = (event) => {
        event.preventDefault();
        if (!usuarioEditado || !permisos.editar || guardando) return;

        const erroresFormulario = Object.fromEntries(
            Object.keys(mensajesObligatorios)
                .filter((campo) => !String(usuarioEditado[campo] ?? '').trim())
                .map((campo) => [campo, [mensajesObligatorios[campo]]]),
        );

        if (usuarioEditado.password || usuarioEditado.password_confirmation) {
            if (!String(usuarioEditado.password ?? '').trim()) {
                erroresFormulario.password = ['La contraseña es obligatoria.'];
            } else if (String(usuarioEditado.password).length < 8) {
                erroresFormulario.password = ['La contraseña debe tener al menos 8 caracteres.'];
            }
            if (!String(usuarioEditado.password_confirmation ?? '').trim()) {
                erroresFormulario.password_confirmation = ['La confirmación de contraseña es obligatoria.'];
            } else if (usuarioEditado.password !== usuarioEditado.password_confirmation) {
                erroresFormulario.password = ['Las contraseñas no coinciden.'];
            }
        }

        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de guardar el usuario.' });
            return;
        }

        setConfirmacion({ usuario: usuarioEditado, accion: 'guardar' });
    };

    const guardarCambios = async () => {
        setGuardando(true);
        setErrores({});
        setMensaje(null);
        try {
            const respuesta = await actualizarUsuario(usuarioEditado.id, {
                ...usuarioEditado,
                id_centro_universitario: usuarioEditado.id_centro_universitario || null,
            });
            setMensaje({ color: 'success', texto: respuesta.message });
            setUsuarioEditado(null);
            setRecarga((actual) => actual + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible actualizar el usuario.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    const solicitarEliminacion = (usuario) => {
        if (permisos.eliminar) setConfirmacion({ usuario, accion: 'eliminar' });
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
            const respuesta = await eliminarUsuario(confirmacion.usuario.id);
            setMensaje({ color: 'success', texto: respuesta.message });
            setConfirmacion(null);
            setRecarga((actual) => actual + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible eliminar el usuario.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    const errorDe = (campo) => errores[campo]?.[0];
    const hayAcciones = permisos.editar || permisos.eliminar;

    return (
        <CCard className="catalog-card catalog-view">
            <CCardHeader>
                <strong>Usuarios</strong>
                <div className="small text-body-secondary">Usuarios registrados en el sistema</div>
            </CCardHeader>
            <CCardBody>
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                <CRow className="g-2 mb-3">
                    <CCol md={6}>
                        <CInputGroup>
                            <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                            <CFormInput type="search" value={busqueda} onChange={(event) => { setBusqueda(event.target.value); setPagina(1); }} placeholder="Buscar por código, nombre o correo electrónico" aria-label="Buscar usuarios" />
                        </CInputGroup>
                    </CCol>
                </CRow>
                {cargando ? <div className="p-4 text-center"><CSpinner /></div> : <CTable responsive hover align="middle">
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Nombre</CTableHeaderCell>
                            <CTableHeaderCell>Código</CTableHeaderCell>
                            <CTableHeaderCell>Correo electrónico</CTableHeaderCell>
                            <CTableHeaderCell>Rol</CTableHeaderCell>
                            <CTableHeaderCell className="catalog-status-cell">Estatus</CTableHeaderCell>
                            {hayAcciones && <CTableHeaderCell className="catalog-actions-cell">Acciones</CTableHeaderCell>}
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {listado.data.map((usuario) => (
                            <CTableRow key={usuario.id}>
                                <CTableDataCell className="catalog-name">{usuario.nombre} {[usuario.apellido_paterno, usuario.apellido_materno].filter(Boolean).join(' ')}</CTableDataCell>
                                <CTableDataCell>{usuario.codigo}</CTableDataCell>
                                <CTableDataCell>{usuario.email ?? usuario.correo ?? '—'}</CTableDataCell>
                                <CTableDataCell>{usuario.rol?.nombre ?? roles.find((r) => r.id === Number(usuario.rol_id))?.nombre ?? (usuario.rol_id ? `Rol ${usuario.rol_id}` : '—')}</CTableDataCell>
                                <CTableDataCell className="catalog-status-cell">
                                    <StatusBadge active={Boolean(usuario.activo)} label={usuario.activo ? 'Activo' : 'Inactivo'} />
                                </CTableDataCell>
                                {hayAcciones && (
                                    <CTableDataCell className="catalog-actions-cell">
                                        <div className="catalog-actions">
                                            {permisos.editar && (
                                                <CButton
                                                    type="button"
                                                    size="sm"
                                                    color="primary"
                                                    variant="ghost"
                                                    className="catalog-action-button btn-ghost-primary"
                                                    title="Editar usuario"
                                                    aria-label="Editar usuario"
                                                    onClick={() => abrirEdicion(usuario)}
                                                    disabled={guardando}
                                                >
                                                    <CIcon icon={cilPencil} />
                                                </CButton>
                                            )}
                                            {permisos.eliminar && (
                                                <CButton
                                                    type="button"
                                                    size="sm"
                                                    color="danger"
                                                    variant="ghost"
                                                    className="catalog-action-button"
                                                    title="Eliminar usuario"
                                                    aria-label="Eliminar usuario"
                                                    onClick={() => solicitarEliminacion(usuario)}
                                                    disabled={guardando}
                                                >
                                                    <CIcon icon={cilTrash} />
                                                </CButton>
                                            )}
                                        </div>
                                    </CTableDataCell>
                                )}
                            </CTableRow>
                        ))}
                        {!listado.data.length && (
                            <CTableRow>
                                <CTableDataCell colSpan={hayAcciones ? 6 : 5} className="text-center text-body-secondary py-4">
                                    Aún no hay usuarios para mostrar.
                                </CTableDataCell>
                            </CTableRow>
                        )}
                    </CTableBody>
                </CTable>}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                    <span className="small text-body-secondary">{listado.total} usuarios registrados</span>
                    {listado.last_page > 1 && (
                        <CPagination size="sm" aria-label="Paginación de usuarios">
                            <CPaginationItem disabled={listado.current_page <= 1} onClick={() => setPagina((actual) => Math.max(1, actual - 1))}>Anterior</CPaginationItem>
                            <CPaginationItem disabled={listado.current_page >= listado.last_page} onClick={() => setPagina((actual) => Math.min(listado.last_page, actual + 1))}>Siguiente</CPaginationItem>
                        </CPagination>
                    )}
                </div>
            </CCardBody>
            <CModal visible={Boolean(usuarioEditado)} backdrop="static" onClose={() => !guardando && setUsuarioEditado(null)}>
                <form onSubmit={solicitarGuardado} noValidate>
                    <CModalHeader closeButton={!guardando}><CModalTitle>Editar usuario</CModalTitle></CModalHeader>
                    <CModalBody>
                        {mensaje?.color === 'danger' && <CAlert color="danger">{mensaje.texto}</CAlert>}
                        {usuarioEditado && (
                            <CRow className="g-3">
                                {camposFormulario.map(([campo, etiqueta, obligatorio]) => (
                                    <CCol md={6} key={campo}>
                                        <label className="form-label" htmlFor={`editar-${campo}`}>
                                            {etiqueta}
                                            {obligatorio && <span className="text-danger ms-1">*</span>}
                                        </label>
                                        <CFormInput
                                            id={`editar-${campo}`}
                                            name={campo}
                                            value={usuarioEditado[campo] ?? ''}
                                            onChange={cambiarCampo}
                                            type={campo === 'id_centro_universitario' ? 'number' : campo === 'email' ? 'email' : 'text'}
                                            required={obligatorio}
                                            invalid={Boolean(errorDe(campo))}
                                            disabled={guardando}
                                        />
                                        {errorDe(campo) && <div className="invalid-feedback d-block">{errorDe(campo)}</div>}
                                    </CCol>
                                ))}
                                <CCol md={6}>
                                    <label className="form-label" htmlFor="editar-rol">
                                        Rol
                                        <span className="text-danger ms-1">*</span>
                                    </label>
                                    <select
                                        id="editar-rol"
                                        name="rol_id"
                                        className={`form-select${errorDe('rol_id') ? ' is-invalid' : ''}`}
                                        value={usuarioEditado.rol_id}
                                        onChange={cambiarCampo}
                                        required
                                        disabled={guardando}
                                    >
                                        {roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
                                    </select>
                                    {errorDe('rol_id') && <div className="invalid-feedback d-block">{errorDe('rol_id')}</div>}
                                </CCol>
                                <CCol md={6}>
                                    <label className="form-label" htmlFor="editar-activo">Estatus</label>
                                    <select
                                        id="editar-activo"
                                        name="activo"
                                        className="form-select"
                                        value={usuarioEditado.activo ? '1' : '0'}
                                        onChange={(event) => setUsuarioEditado((actual) => ({ ...actual, activo: event.target.value === '1' }))}
                                        disabled={guardando}
                                    >
                                        <option value="1">Activo</option>
                                        <option value="0">Inactivo</option>
                                    </select>
                                </CCol>
                                <CCol md={6}>
                                    <label className="form-label" htmlFor="editar-password">Nueva contraseña</label>
                                    <CFormInput
                                        id="editar-password"
                                        name="password"
                                        type="password"
                                        value={usuarioEditado.password}
                                        onChange={cambiarCampo}
                                        invalid={Boolean(errorDe('password'))}
                                        disabled={guardando}
                                    />
                                    {errorDe('password') && <div className="invalid-feedback d-block">{errorDe('password')}</div>}
                                </CCol>
                                <CCol md={6}>
                                    <label className="form-label" htmlFor="editar-password-confirmation">Confirmar contraseña</label>
                                    <CFormInput
                                        id="editar-password-confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        value={usuarioEditado.password_confirmation}
                                        onChange={cambiarCampo}
                                        invalid={Boolean(errorDe('password_confirmation'))}
                                        disabled={guardando}
                                    />
                                    {errorDe('password_confirmation') && <div className="invalid-feedback d-block">{errorDe('password_confirmation')}</div>}
                                </CCol>
                            </CRow>
                        )}
                    </CModalBody>
                    <CModalFooter>
                        <CButton type="button" color="secondary" variant="outline" onClick={() => setUsuarioEditado(null)} disabled={guardando}>Cancelar</CButton>
                        <CButton type="submit" className="btn-vaai" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</CButton>
                    </CModalFooter>
                </form>
            </CModal>
            {hayAcciones && (
                <CModal visible={Boolean(confirmacion)} backdrop="static" onClose={() => !guardando && setConfirmacion(null)}>
                    <CModalHeader closeButton={!guardando}><CModalTitle>Confirmar operación</CModalTitle></CModalHeader>
                    <CModalBody>
                        {confirmacion?.accion === 'eliminar'
                            ? <>¿Deseas eliminar definitivamente al usuario <strong>{confirmacion.usuario.nombre}</strong>?</>
                            : <>¿Deseas guardar los cambios del usuario <strong>{confirmacion?.usuario.nombre}</strong>?</>}
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

export default Usuarios;

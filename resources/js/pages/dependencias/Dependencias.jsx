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
import CentroUniversitarioSelector from '../../components/CentroUniversitarioSelector';
import { StatusBadge } from '../../components/catalogos/CatalogPresentation';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import { actualizarDependencia, buscarCodigoPostal, crearDependencia, eliminarDependencia, listarDependencias, listarEntidadesFederativas, listarPaises } from '../../services/dependencias';

const mensajesObligatorios = {
    nombre_rector: 'El nombre del rector es obligatorio.',
    tipo_dependencia: 'El tipo de dependencia es obligatorio.',
    nombre: 'El nombre de la dependencia es obligatorio.',
    siglas: 'Las siglas son obligatorias.',
    direccion: 'La dirección es obligatoria.',
    telefonos: 'El teléfono es obligatorio.',
    pais: 'El país es obligatorio.',
    colonia: 'La colonia es obligatoria.',
    codigo_postal: 'El código postal es obligatorio.',
    municipio: 'El municipio es obligatorio.',
    estado: 'El estado es obligatorio.',
};

const formularioInicial = {
    nombre_rector: '',
    tipo_dependencia: '',
    nombre: '',
    siglas: '',
    direccion: '',
    telefonos: '',
    sitio_web: '',
    pais: 'México',
    codigo_postal: '',
    estado: '',
    municipio: '',
    colonia: '',
    estatus: 'activo',
};

const etiquetasEstatus = { activo: 'Activo', inactivo: 'Inactivo', pendiente: 'Pendiente' };

function Dependencias() {
    const permisos = usePermisos('dependencias');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;
    const [listado, setListado] = useState({ data: [], total: 0, last_page: 1 });
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(1);
    const [recarga, setRecarga] = useState(0);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [dependenciaEditada, setDependenciaEditada] = useState(null);
    const [confirmacion, setConfirmacion] = useState(null);
    const [mostrarSugerenciasPais, setMostrarSugerenciasPais] = useState(false);
    const [mostrarSugerenciasEstado, setMostrarSugerenciasEstado] = useState(false);
    const [paises, setPaises] = useState([]);
    const [entidadesFederativas, setEntidadesFederativas] = useState([]);
    const [informacionPostal, setInformacionPostal] = useState(null);
    const [cargandoPostal, setCargandoPostal] = useState(false);
    const [errorPostal, setErrorPostal] = useState('');

    const cargar = (signal) => {
        setCargando(true);
        listarDependencias({ buscar: busqueda || undefined, page: pagina }, signal)
            .then((respuesta) => {
                if (!signal.aborted) setListado(respuesta.data);
            })
            .catch((error) => {
                if (!signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar las dependencias.' });
                }
            })
            .finally(() => {
                if (!signal.aborted) setCargando(false);
            });
    };

    useEffect(() => {
        const controller = new AbortController();
        const timer = window.setTimeout(() => cargar(controller.signal), 250);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [busqueda, pagina, recarga]);

    useEffect(() => {
        if (!permisos.crear && !permisos.editar) return undefined;
        const controller = new AbortController();
        Promise.all([listarPaises(controller.signal), listarEntidadesFederativas({ pais: 'México' }, controller.signal)])
            .then(([respuestaPaises, respuestaEntidades]) => {
                if (controller.signal.aborted) return;
                setPaises(respuestaPaises.data);
                setEntidadesFederativas(respuestaEntidades.data);
            })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar los catálogos de ubicación.' });
                }
            });
        return () => controller.abort();
    }, [permisos.crear]);

    useEffect(() => {
        if (formulario.pais !== 'México') {
            setInformacionPostal(null);
            setCargandoPostal(false);
            setErrorPostal('');
            return undefined;
        }

        const codigoPostal = formulario.codigo_postal.trim();
        if (!/^\d{5}$/.test(codigoPostal)) {
            setInformacionPostal(null);
            setCargandoPostal(false);
            setErrorPostal('');
            setFormulario((actual) => ({ ...actual, estado: '', municipio: '', colonia: '' }));
            return undefined;
        }

        const controller = new AbortController();
        const coloniaActual = formulario.colonia;
        setInformacionPostal(null);
        setCargandoPostal(true);
        setErrorPostal('');
        setFormulario((actual) => ({ ...actual, estado: '', municipio: '', colonia: '' }));
        buscarCodigoPostal(codigoPostal, controller.signal)
            .then((respuesta) => {
                if (controller.signal.aborted) return;
                setInformacionPostal(respuesta.data);
                setFormulario((actual) => ({
                    ...actual,
                    estado: respuesta.data.estado,
                    municipio: respuesta.data.municipio,
                    colonia: respuesta.data.colonias.includes(coloniaActual)
                        ? coloniaActual
                        : respuesta.data.colonias.length === 1 ? respuesta.data.colonias[0] : '',
                }));
            })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error)) {
                    setInformacionPostal(null);
                    setErrorPostal(error.response?.data?.message ?? 'No fue posible consultar el código postal.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargandoPostal(false);
            });

        return () => controller.abort();
    }, [formulario.codigo_postal, formulario.pais]);

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        if (name === 'pais' && value !== 'México') {
            setInformacionPostal(null);
            setErrorPostal('');
            setMostrarSugerenciasEstado(false);
            setFormulario((actual) => ({
                ...actual,
                pais: value,
                codigo_postal: '',
                estado: '',
                municipio: '',
                colonia: '',
            }));
            if (errores[name]) setErrores((actual) => ({ ...actual, [name]: undefined }));
            return;
        }
        setFormulario((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) setErrores((actual) => ({ ...actual, [name]: undefined }));
    };

    const guardar = (event) => {
        event.preventDefault();
        if ((!permisos.crear && !dependenciaEditada) || (dependenciaEditada && !permisos.editar) || guardando) return;
        const requeridos = Object.keys(mensajesObligatorios);
        const erroresFormulario = Object.fromEntries(requeridos
            .filter((campo) => !formulario[campo].trim())
            .map((campo) => [campo, [mensajesObligatorios[campo]]]));
        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de guardar la dependencia.' });
            return;
        }

        if (dependenciaEditada) {
            setConfirmacion({ dependencia: dependenciaEditada, accion: 'guardar' });
            return;
        }

        void guardarDependencia();
    };

    const guardarDependencia = async () => {

        setGuardando(true);
        setErrores({});
        setMensaje(null);
        try {
            const respuesta = dependenciaEditada
                ? await actualizarDependencia(dependenciaEditada.id, formulario)
                : await crearDependencia(formulario);
            setMensaje({ color: 'success', texto: respuesta.message });
            setFormulario(formularioInicial);
            setDependenciaEditada(null);
            setModalVisible(false);
            setRecarga((actual) => actual + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible guardar la dependencia.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    const errorDe = (campo) => errores[campo]?.[0];
    const textoPais = formulario.pais.trim().toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sugerenciasPais = paises.filter((pais) => (
        pais.nombre.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(textoPais)
    )).slice(0, 5);
    const textoEstado = formulario.estado.trim().toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sugerenciasEstado = formulario.pais === 'México' && textoEstado ? entidadesFederativas.filter((entidad) => (
        entidad.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(textoEstado)
    )).slice(0, 3) : [];
    const seleccionarPais = (pais) => {
        cambiarCampo({ target: { name: 'pais', value: pais.nombre } });
        setMostrarSugerenciasPais(false);
    };
    const seleccionarEstado = (estado) => {
        setFormulario((actual) => ({ ...actual, estado }));
        setErrores((actual) => ({ ...actual, estado: undefined }));
        setMostrarSugerenciasEstado(false);
    };
    const cambiarNombreDependencia = (valor) => {
        setFormulario((actual) => ({ ...actual, nombre: valor }));
        if (errores.nombre) setErrores((actual) => ({ ...actual, nombre: undefined }));
    };
    const seleccionarCentroUniversitario = (centro) => {
        setFormulario((actual) => ({
            ...actual,
            nombre: centro.nombre,
            siglas: centro.abreviatura || actual.siglas,
        }));
        setErrores((actual) => ({ ...actual, nombre: undefined, siglas: undefined }));
    };
    const abrirFormulario = () => {
        setFormulario(formularioInicial);
        setDependenciaEditada(null);
        setErrores({});
        setMensaje(null);
        setInformacionPostal(null);
        setErrorPostal('');
        setMostrarSugerenciasPais(false);
        setMostrarSugerenciasEstado(false);
        setModalVisible(true);
    };
    const abrirEdicion = (dependencia) => {
        setFormulario({
            ...formularioInicial,
            ...Object.fromEntries(Object.keys(formularioInicial).map((campo) => [campo, dependencia[campo] ?? formularioInicial[campo]])),
            estatus: dependencia.estatus ?? (dependencia.vigente ? 'activo' : 'inactivo'),
        });
        setDependenciaEditada(dependencia);
        setErrores({});
        setMensaje(null);
        setInformacionPostal(null);
        setErrorPostal('');
        setMostrarSugerenciasPais(false);
        setMostrarSugerenciasEstado(false);
        setModalVisible(true);
    };
    const solicitarEliminacion = (dependencia) => {
        if (permisos.eliminar) setConfirmacion({ dependencia, accion: 'eliminar' });
    };
    const ejecutarConfirmacion = async () => {
        if (!confirmacion || guardando) return;
        if (confirmacion.accion === 'guardar') {
            setConfirmacion(null);
            void guardarDependencia();
            return;
        }
        if (!permisos.eliminar) return;
        setGuardando(true);
        setMensaje(null);
        try {
            const respuesta = await eliminarDependencia(confirmacion.dependencia.id);
            setMensaje({ color: 'success', texto: respuesta.message });
            setConfirmacion(null);
            setRecarga((actual) => actual + 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible eliminar la dependencia.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    return (
        <CCard className="catalog-card catalog-view">
            <CCardHeader className="d-flex justify-content-between align-items-center">
                <div><strong>Dependencias</strong><div className="small text-body-secondary">Dependencias registradas en el inventario</div></div>
                {permisos.crear && <CButton size="sm" className="btn-vaai" onClick={abrirFormulario}>Nueva dependencia</CButton>}
            </CCardHeader>
            <CCardBody>
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                <CRow className="g-2 mb-3"><CCol md={6}><CInputGroup><CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText><CFormInput type="search" value={busqueda} onChange={(event) => { setBusqueda(event.target.value); setPagina(1); }} placeholder="Buscar por nombre, siglas o municipio" aria-label="Buscar dependencias" /></CInputGroup></CCol></CRow>
                {cargando ? <div className="p-4 text-center"><CSpinner /></div> : <>
                <CTable responsive hover align="middle">
                    <CTableHead><CTableRow><CTableHeaderCell>Nombre</CTableHeaderCell><CTableHeaderCell>Siglas</CTableHeaderCell><CTableHeaderCell>Tipo</CTableHeaderCell><CTableHeaderCell>Municipio</CTableHeaderCell><CTableHeaderCell className="catalog-status-cell">Estatus</CTableHeaderCell><CTableHeaderCell className="catalog-actions-cell">Acciones</CTableHeaderCell></CTableRow></CTableHead>
                    <CTableBody>
                        {listado.data.map((dependencia) => <CTableRow key={dependencia.id}><CTableDataCell className="catalog-name">{dependencia.nombre}</CTableDataCell><CTableDataCell>{dependencia.siglas}</CTableDataCell><CTableDataCell>{dependencia.tipo_dependencia}</CTableDataCell><CTableDataCell>{dependencia.municipio}</CTableDataCell><CTableDataCell className="catalog-status-cell"><StatusBadge active={dependencia.estatus === 'activo' || (!dependencia.estatus && dependencia.vigente)} label={etiquetasEstatus[dependencia.estatus] ?? (dependencia.vigente ? 'Activo' : 'Inactivo')} /></CTableDataCell><CTableDataCell className="catalog-actions-cell">{(permisos.editar || permisos.eliminar) && <div className="catalog-actions">{permisos.editar && <CButton type="button" size="sm" color="primary" variant="ghost" className="catalog-action-button btn-ghost-primary" title="Editar dependencia" aria-label="Editar dependencia" onClick={() => abrirEdicion(dependencia)} disabled={guardando}><CIcon icon={cilPencil} /></CButton>}{permisos.eliminar && <CButton type="button" size="sm" color="danger" variant="ghost" className="catalog-action-button" title="Eliminar dependencia" aria-label="Eliminar dependencia" onClick={() => solicitarEliminacion(dependencia)} disabled={guardando}><CIcon icon={cilTrash} /></CButton>}</div>}</CTableDataCell></CTableRow>)}
                        {!listado.data.length && <CTableRow><CTableDataCell colSpan={6} className="text-center text-body-secondary">No hay dependencias que coincidan con la búsqueda.</CTableDataCell></CTableRow>}
                    </CTableBody>
                </CTable>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2"><span className="small text-body-secondary">{listado.total} dependencias registradas</span>
                    {listado.last_page > 1 && <CPagination size="sm" aria-label="Paginación de dependencias">
                        <CPaginationItem disabled={listado.current_page <= 1} onClick={() => setPagina((actual) => Math.max(1, actual - 1))}>Anterior</CPaginationItem>
                        <CPaginationItem disabled={listado.current_page >= listado.last_page} onClick={() => setPagina((actual) => Math.min(listado.last_page, actual + 1))}>Siguiente</CPaginationItem>
                    </CPagination>}
                </div>
                </>}
                {(permisos.crear || permisos.editar) && <CModal visible={modalVisible} backdrop="static" onClose={() => !guardando && setModalVisible(false)}>
                    <CForm onSubmit={guardar} noValidate>
                        <CModalHeader closeButton={!guardando}><CModalTitle>{dependenciaEditada ? 'Modificar dependencia' : 'Nueva dependencia'}</CModalTitle></CModalHeader>
                        <CModalBody>
                            {mensaje?.color === 'danger' && <CAlert color="danger">{mensaje.texto}</CAlert>}
                            <div className="mb-3">
                                <CentroUniversitarioSelector
                                    id="dependencia-nombre"
                                    label="Nombre de la dependencia"
                                    value={formulario.nombre}
                                    onChange={cambiarNombreDependencia}
                                    onSelect={seleccionarCentroUniversitario}
                                    required
                                    invalid={Boolean(errorDe('nombre'))}
                                    error={errorDe('nombre')}
                                    disabled={guardando}
                                    placeholder="Escribe o busca un centro universitario"
                                    helperText="Puedes elegir un centro del catálogo para autocompletar nombre y siglas."
                                />
                            </div>
                            {[['siglas', 'Siglas'], ['nombre_rector', 'Nombre del rector'], ['tipo_dependencia', 'Tipo de dependencia'], ['direccion', 'Dirección'], ['telefonos', 'Teléfonos'], ['pais', 'País'], ['codigo_postal', 'Código postal'], ['estado', 'Estado'], ['municipio', 'Municipio'], ['colonia', 'Colonia'], ['sitio_web', 'Sitio web']].map(([campo, etiqueta]) => <div className="mb-3" key={campo}>
                                <CFormLabel htmlFor={`dependencia-${campo}`}>{etiqueta}{campo !== 'sitio_web' && <span className="text-danger ms-1">*</span>}</CFormLabel>
                                {campo === 'colonia' && informacionPostal ? <CFormSelect id="dependencia-colonia" name="colonia" value={formulario.colonia} onChange={cambiarCampo} required invalid={Boolean(errorDe(campo))} disabled={guardando}>
                                    <option value="">Selecciona una colonia</option>
                                    {informacionPostal.colonias.map((colonia) => <option key={colonia} value={colonia}>{colonia}</option>)}
                                </CFormSelect> : <CFormInput id={`dependencia-${campo}`} name={campo} value={formulario[campo]} onChange={(event) => { cambiarCampo(event); if (campo === 'pais') setMostrarSugerenciasPais(true); if (campo === 'estado') setMostrarSugerenciasEstado(true); }} onFocus={() => { if (campo === 'pais') setMostrarSugerenciasPais(true); if (campo === 'estado') setMostrarSugerenciasEstado(true); }} onBlur={() => { if (campo === 'pais') window.setTimeout(() => setMostrarSugerenciasPais(false), 150); if (campo === 'estado') window.setTimeout(() => setMostrarSugerenciasEstado(false), 150); }} autoComplete={(campo === 'pais' || campo === 'estado') ? 'off' : undefined} inputMode={campo === 'codigo_postal' ? 'numeric' : undefined} maxLength={campo === 'codigo_postal' ? 5 : undefined} readOnly={(campo === 'estado' || campo === 'municipio') && Boolean(informacionPostal)} required={campo !== 'sitio_web'} invalid={Boolean(errorDe(campo))} disabled={guardando} />}
                                {campo === 'pais' && mostrarSugerenciasPais && textoPais && sugerenciasPais.length > 0 && <div className="list-group mt-1" role="listbox" aria-label="Sugerencias de países">
                                    {sugerenciasPais.map((pais) => <button key={pais.id} type="button" className="list-group-item list-group-item-action text-start" onMouseDown={() => seleccionarPais(pais)}>{pais.nombre}</button>)}
                                </div>}
                                {campo === 'codigo_postal' && formulario.pais !== 'México' && <div className="form-text">El catálogo postal disponible corresponde a México.</div>}
                                {campo === 'codigo_postal' && cargandoPostal && <div className="form-text">Consultando código postal...</div>}
                                {campo === 'codigo_postal' && errorPostal && <div className="invalid-feedback d-block">{errorPostal}</div>}
                                {campo === 'estado' && mostrarSugerenciasEstado && textoEstado && sugerenciasEstado.length > 0 && <div className="list-group mt-1" role="listbox" aria-label="Sugerencias de entidades federativas">
                                    {sugerenciasEstado.map((entidad) => <button key={entidad} type="button" className="list-group-item list-group-item-action text-start" onMouseDown={() => seleccionarEstado(entidad)}>{entidad}</button>)}
                                </div>}
                                {errorDe(campo) && <div className="invalid-feedback d-block">{errorDe(campo)}</div>}
                            </div>)}
                            <div className="mb-3">
                                <CFormLabel htmlFor="dependencia-estatus">Estatus</CFormLabel>
                                <CFormSelect id="dependencia-estatus" name="estatus" value={formulario.estatus} onChange={cambiarCampo} disabled={guardando} invalid={Boolean(errorDe('estatus'))}>
                                    {Object.entries(etiquetasEstatus).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
                                </CFormSelect>
                                {errorDe('estatus') && <div className="invalid-feedback d-block">{errorDe('estatus')}</div>}
                            </div>
                        </CModalBody>
                        <CModalFooter><CButton color="secondary" variant="outline" onClick={() => setModalVisible(false)} disabled={guardando}>Cancelar</CButton><CButton type="submit" className="btn-vaai" disabled={guardando}>{guardando ? <><CSpinner size="sm" className="me-2" />Guardando...</> : dependenciaEditada ? 'Guardar cambios' : 'Registrar dependencia'}</CButton></CModalFooter>
                    </CForm>
                </CModal>}
                {(permisos.editar || permisos.eliminar) && <CModal visible={Boolean(confirmacion)} backdrop="static" onClose={() => !guardando && setConfirmacion(null)}>
                    <CModalHeader closeButton={!guardando}><CModalTitle>Confirmar operación</CModalTitle></CModalHeader>
                    <CModalBody>
                        {confirmacion?.accion === 'eliminar'
                            ? <>¿Deseas eliminar definitivamente la dependencia <strong>{confirmacion.dependencia.nombre}</strong>?</>
                            : <>¿Deseas guardar los cambios de la dependencia <strong>{confirmacion?.dependencia.nombre}</strong>?</>}
                    </CModalBody>
                    <CModalFooter><CButton color="secondary" variant="outline" onClick={() => setConfirmacion(null)} disabled={guardando}>Cancelar</CButton><CButton color={confirmacion?.accion === 'eliminar' ? 'danger' : 'primary'} onClick={ejecutarConfirmacion} disabled={guardando}>{guardando ? 'Procesando...' : 'Confirmar'}</CButton></CModalFooter>
                </CModal>}
            </CCardBody>
        </CCard>
    );
}

export default Dependencias;

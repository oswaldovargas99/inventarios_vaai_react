import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CPagination,
    CPaginationItem,
    CSpinner,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react';
import CentroUniversitarioSelector, {
    etiquetaCentroUniversitario,
} from '../../components/CentroUniversitarioSelector';
import useAuth from '../../hooks/useAuth';
import usePermisos from '../../hooks/usePermisos';
import {
    crearTraslado,
    listarEquipos,
    listarTraslados,
} from '../../services/equipoService';

const tiposDependencia = [
    { valor: 'piso', etiqueta: 'Piso' },
    { valor: 'centro_universitario', etiqueta: 'Centro universitario' },
    { valor: 'preparatoria', etiqueta: 'Preparatoria' },
];

const destinosFijos = {
    piso: [1, 2, 3, 4, 5].map((piso) => ({ valor: `Piso ${piso}`, etiqueta: `Piso ${piso}` })),
    preparatoria: [1, 2, 3, 4, 5].map((numero) => ({ valor: `Preparatoria ${numero}`, etiqueta: `Preparatoria ${numero}` })),
};

const formularioInicial = { equipo_id: '', dependencia: '', destino: '' };

function Traslados() {
    const permisos = usePermisos('equipos');
    const { manejarErrorSesion } = useAuth();
    const manejarError = useRef(manejarErrorSesion);
    manejarError.current = manejarErrorSesion;
    const [listado, setListado] = useState({ data: [], total: 0, last_page: 1 });
    const [equipos, setEquipos] = useState([]);
    const [trasladosActuales, setTrasladosActuales] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [textoCentro, setTextoCentro] = useState('');
    const [centroSeleccionado, setCentroSeleccionado] = useState(false);
    const [editor, setEditor] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [mensaje, setMensaje] = useState(null);
    const [errores, setErrores] = useState({});
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    const esCentroUniversitario = formulario.dependencia === 'centro_universitario';

    const cargarTraslados = (signal, page = pagina) => {
        setCargando(true);
        listarTraslados({ page }, signal)
            .then((respuesta) => {
                if (!signal.aborted) setListado(respuesta);
            })
            .catch((error) => {
                if (!signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar los traslados.' });
                }
            })
            .finally(() => {
                if (!signal.aborted) setCargando(false);
            });
    };

    useEffect(() => {
        const controller = new AbortController();
        cargarTraslados(controller.signal);
        return () => controller.abort();
    }, [pagina]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([
            listarEquipos({ per_page: 100 }, controller.signal),
            listarTraslados({ per_page: 100 }, controller.signal),
        ])
            .then(([equiposRespuesta, trasladosRespuesta]) => {
                if (!controller.signal.aborted) {
                    setEquipos((equiposRespuesta.data ?? []).filter((equipo) => equipo.estatus !== 'para_baja'));
                    setTrasladosActuales(trasladosRespuesta.data ?? []);
                }
            })
            .catch((error) => {
                if (!controller.signal.aborted && !axios.isCancel(error) && !manejarError.current(error)) {
                    setMensaje({ color: 'danger', texto: 'No fue posible cargar los equipos disponibles.' });
                }
            });
        return () => controller.abort();
    }, []);

    const reiniciarDestinoCentro = () => {
        setTextoCentro('');
        setCentroSeleccionado(false);
    };

    const abrirEditor = () => {
        setFormulario(formularioInicial);
        reiniciarDestinoCentro();
        setErrores({});
        setMensaje(null);
        setMostrarSugerencias(false);
        setEditor(true);
    };

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        const cambiaDependencia = name === 'dependencia';
        setFormulario((actual) => ({
            ...actual,
            [name]: value,
            ...(cambiaDependencia ? { destino: '' } : {}),
        }));
        if (cambiaDependencia) reiniciarDestinoCentro();
        if (errores[name] || (cambiaDependencia && errores.destino)) {
            setErrores((actual) => ({
                ...actual,
                [name]: undefined,
                ...(cambiaDependencia ? { destino: undefined } : {}),
            }));
        }
    };

    const cambiarCentro = (valor) => {
        setTextoCentro(valor);
        setCentroSeleccionado(false);
        setFormulario((actual) => ({ ...actual, destino: '' }));
        if (errores.destino) setErrores((actual) => ({ ...actual, destino: undefined }));
    };

    const seleccionarCentro = (centro) => {
        const destino = centro.abreviatura || centro.nombre;
        setTextoCentro(etiquetaCentroUniversitario(centro));
        setCentroSeleccionado(true);
        setFormulario((actual) => ({ ...actual, destino }));
        if (errores.destino) setErrores((actual) => ({ ...actual, destino: undefined }));
    };

    const guardar = async (event) => {
        event.preventDefault();
        if (!permisos.crear || guardando) return;

        const erroresFormulario = {};
        if (!formulario.equipo_id.trim()) erroresFormulario.equipo_id = ['Escribe el ID del equipo.'];
        else if (!equipoSeleccionado) erroresFormulario.equipo_id = ['El ID escrito no coincide con un equipo disponible.'];
        if (!formulario.dependencia) erroresFormulario.dependencia = ['Selecciona una dependencia.'];
        if (esCentroUniversitario) {
            if (!formulario.destino || !centroSeleccionado) {
                erroresFormulario.destino = ['Selecciona un centro universitario de la lista de sugerencias.'];
            }
        } else if (!formulario.destino) {
            erroresFormulario.destino = ['Selecciona un destino.'];
        }
        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de guardar el traslado.' });
            return;
        }

        setGuardando(true);
        setMensaje(null);
        setErrores({});
        try {
            const respuesta = await crearTraslado({ ...formulario, equipo_id: equipoSeleccionado.id });
            setMensaje({ color: 'success', texto: respuesta.message });
            setTrasladosActuales((actuales) => {
                const trasladoActualizado = respuesta.data;
                const existe = actuales.some((traslado) => traslado.id === trasladoActualizado.id);

                return existe
                    ? actuales.map((traslado) => (traslado.id === trasladoActualizado.id
                        ? trasladoActualizado
                        : traslado))
                    : [trasladoActualizado, ...actuales];
            });
            setFormulario(formularioInicial);
            reiniciarDestinoCentro();
            setMostrarSugerencias(false);
            setEditor(false);
            setPagina(1);
            const controller = new AbortController();
            cargarTraslados(controller.signal, 1);
        } catch (error) {
            if (!manejarError.current(error)) {
                setErrores(error.response?.data?.errors ?? {});
                setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible registrar el traslado.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    const errorDe = (campo) => errores[campo]?.[0];
    const opcionesDestino = destinosFijos[formulario.dependencia] ?? [];
    const textoEquipo = formulario.equipo_id.trim().toLowerCase();
    const equipoSeleccionado = equipos.find((equipo) => (
        String(equipo.id_equipo).toLowerCase() === textoEquipo
        || String(equipo.id) === formulario.equipo_id.trim()
    ));
    const sugerenciasEquipo = equipos.filter((equipo) => {
        if (!textoEquipo) return true;
        return String(equipo.id_equipo).toLowerCase().startsWith(textoEquipo);
    }).slice(0, 3);
    const trasladoActual = trasladosActuales.find(
        (traslado) => String(traslado.equipo?.id) === String(equipoSeleccionado?.id),
    );

    return (
        <CCard className="catalog-view">
            <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Traslados</strong>
                    <div className="small text-body-secondary">Historial de traslados de equipos</div>
                </div>
                {permisos.crear && (
                    <CButton color="primary" onClick={abrirEditor}>Trasladar equipo</CButton>
                )}
            </CCardHeader>
            <CCardBody className="p-0">
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                {cargando ? (
                    <div className="p-4 text-center"><CSpinner /></div>
                ) : (
                    <>
                        <CTable responsive hover align="middle" className="mb-0">
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>ID equipo</CTableHeaderCell>
                                    <CTableHeaderCell>Número de serie</CTableHeaderCell>
                                    <CTableHeaderCell>Tipo de equipo</CTableHeaderCell>
                                    <CTableHeaderCell>Modelo</CTableHeaderCell>
                                    <CTableHeaderCell>Dependencia</CTableHeaderCell>
                                    <CTableHeaderCell>Destino</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {listado.data.map((traslado) => (
                                    <CTableRow key={traslado.id}>
                                        <CTableDataCell>{traslado.equipo?.id_equipo ?? '—'}</CTableDataCell>
                                        <CTableDataCell>{traslado.equipo?.numero_serie ?? '—'}</CTableDataCell>
                                        <CTableDataCell>{traslado.equipo?.tipo_equipo?.nombre ?? '—'}</CTableDataCell>
                                        <CTableDataCell>{traslado.equipo?.modelo?.nombre ?? '—'}</CTableDataCell>
                                        <CTableDataCell>
                                            {tiposDependencia.find((item) => item.valor === traslado.dependencia)?.etiqueta ?? traslado.dependencia}
                                        </CTableDataCell>
                                        <CTableDataCell>{traslado.destino}</CTableDataCell>
                                    </CTableRow>
                                ))}
                                {!listado.data.length && (
                                    <CTableRow>
                                        <CTableDataCell colSpan={6} className="text-center text-body-secondary">
                                            No hay traslados registrados.
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                        <div className="d-flex justify-content-between align-items-center p-3">
                            <span className="small text-body-secondary">{listado.total} traslados registrados</span>
                            <CPagination size="sm" aria-label="Paginación de traslados">
                                <CPaginationItem disabled={pagina <= 1} onClick={() => setPagina((actual) => actual - 1)}>Anterior</CPaginationItem>
                                <CPaginationItem disabled={pagina >= listado.last_page} onClick={() => setPagina((actual) => actual + 1)}>Siguiente</CPaginationItem>
                            </CPagination>
                        </div>
                    </>
                )}
            </CCardBody>
            <CModal visible={editor} backdrop="static" onClose={() => !guardando && setEditor(false)}>
                <CForm onSubmit={guardar} noValidate>
                    <CModalHeader closeButton={!guardando}>
                        <CModalTitle>Trasladar equipo</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CFormLabel htmlFor="traslado-equipo">ID del equipo</CFormLabel>
                        <CFormInput
                            id="traslado-equipo"
                            name="equipo_id"
                            value={formulario.equipo_id}
                            onChange={cambiarCampo}
                            onFocus={() => setMostrarSugerencias(true)}
                            onBlur={() => window.setTimeout(() => setMostrarSugerencias(false), 150)}
                            placeholder="Escribe el ID del equipo"
                            autoComplete="off"
                            required
                            invalid={Boolean(errorDe('equipo_id'))}
                        />
                        {mostrarSugerencias && sugerenciasEquipo.length > 0 && (
                            <div className="list-group mt-1" role="listbox" aria-label="Sugerencias de equipos">
                                {sugerenciasEquipo.map((equipo) => (
                                    <button
                                        key={equipo.id}
                                        type="button"
                                        className="list-group-item list-group-item-action text-start"
                                        onMouseDown={() => {
                                            setFormulario((actual) => ({ ...actual, equipo_id: equipo.id_equipo }));
                                            setErrores((actual) => ({ ...actual, equipo_id: undefined }));
                                            setMostrarSugerencias(false);
                                        }}
                                    >
                                        <strong>{equipo.id_equipo}</strong>
                                        <span className="d-block small text-body-secondary">
                                            Serie: {equipo.numero_serie}
                                            {equipo.modelo?.nombre ? ` · Modelo: ${equipo.modelo.nombre}` : ''}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {errorDe('equipo_id') && <div className="invalid-feedback d-block">{errorDe('equipo_id')}</div>}
                        {equipoSeleccionado && (
                            <CAlert color="light" className="mt-3 mb-0">
                                <strong>Modelo:</strong> {equipoSeleccionado.modelo?.nombre ?? '—'}
                            </CAlert>
                        )}
                        {trasladoActual && (
                            <CAlert color="warning" className="mt-3 mb-0">
                                Este equipo ya se encuentra trasladado a <strong>{trasladoActual.destino}</strong>. El nuevo traslado actualizará ese registro.
                            </CAlert>
                        )}
                        <CFormLabel htmlFor="traslado-dependencia" className="mt-3">Dependencia</CFormLabel>
                        <CFormSelect
                            id="traslado-dependencia"
                            name="dependencia"
                            value={formulario.dependencia}
                            onChange={cambiarCampo}
                            required
                            invalid={Boolean(errorDe('dependencia'))}
                        >
                            <option value="">Selecciona una dependencia</option>
                            {tiposDependencia.map((dependencia) => (
                                <option key={dependencia.valor} value={dependencia.valor}>{dependencia.etiqueta}</option>
                            ))}
                        </CFormSelect>
                        {errorDe('dependencia') && <div className="invalid-feedback d-block">{errorDe('dependencia')}</div>}
                        {esCentroUniversitario ? (
                            <div className="mt-3">
                                <CentroUniversitarioSelector
                                    id="traslado-destino-centro"
                                    label="Centro universitario"
                                    value={textoCentro}
                                    onChange={cambiarCentro}
                                    onSelect={seleccionarCentro}
                                    seleccionado={centroSeleccionado}
                                    required
                                    invalid={Boolean(errorDe('destino'))}
                                    error={errorDe('destino')}
                                    disabled={guardando}
                                />
                            </div>
                        ) : (
                            <>
                                <CFormLabel htmlFor="traslado-destino" className="mt-3">
                                    {formulario.dependencia
                                        ? `Selecciona ${tiposDependencia.find((item) => item.valor === formulario.dependencia)?.etiqueta.toLowerCase()}`
                                        : 'Destino'}
                                </CFormLabel>
                                <CFormSelect
                                    id="traslado-destino"
                                    name="destino"
                                    value={formulario.destino}
                                    onChange={cambiarCampo}
                                    required
                                    disabled={!formulario.dependencia || guardando}
                                    invalid={Boolean(errorDe('destino'))}
                                >
                                    <option value="">Selecciona un destino</option>
                                    {opcionesDestino.map((destino) => (
                                        <option key={destino.valor} value={destino.valor}>{destino.etiqueta}</option>
                                    ))}
                                </CFormSelect>
                                {errorDe('destino') && <div className="invalid-feedback d-block">{errorDe('destino')}</div>}
                            </>
                        )}
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" variant="outline" onClick={() => setEditor(false)} disabled={guardando}>Cancelar</CButton>
                        <CButton color="primary" type="submit" disabled={guardando}>
                            {guardando ? 'Guardando...' : 'Guardar traslado'}
                        </CButton>
                    </CModalFooter>
                </CForm>
            </CModal>
        </CCard>
    );
}

export default Traslados;

import { CatalogHeader, StatusBadge, CatalogLoading, CatalogEmptyState } from '../components/catalogos/CatalogPresentation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import usePermisos from '../hooks/usePermisos';
import useAuth from '../hooks/useAuth';

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

import {
    cilArrowBottom,
    cilArrowTop,
    cilCheckCircle,
    cilDescription,
    cilMagnifyingGlass,
    cilPencil,
    cilPlus,
    cilReload,
    cilTrash,
    cilX,
    cilXCircle,
} from '@coreui/icons';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

function TiposEquipo() {
    const montado = useRef(false);
    const consultaListado = useRef(null);
    const parametrosListado = useRef(null);
    const bloqueosEstatus = useRef(new Set());
    const [estatusPendientes, setEstatusPendientes] = useState(new Set());
    const { manejarErrorSesion } = useAuth();
    const permisos = usePermisos('tiposEquipo');
    const mostrarAcciones = permisos.editar || permisos.cambiarEstatus || permisos.eliminar;
    const [tiposEquipo, setTiposEquipo] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [busqueda, setBusqueda] = useState('');

    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('success');

    const [modalVisible, setModalVisible] = useState(false);

    const [
        modalEliminarVisible,
        setModalEliminarVisible
    ] = useState(false);

    const [modoEdicion, setModoEdicion] = useState(false);

    const [
        tipoSeleccionado,
        setTipoSeleccionado
    ] = useState(null);

    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: '',
    });

    const [errores, setErrores] = useState({});
    const puedeGuardar = modoEdicion ? permisos.editar : permisos.crear;

    /*
    |--------------------------------------------------------------------------
    | Paginación
    |--------------------------------------------------------------------------
    */

    const [paginaActual, setPaginaActual] = useState(1);
    const [ultimaPagina, setUltimaPagina] = useState(1);

    const [
        totalRegistros,
        setTotalRegistros
    ] = useState(0);

    const [
        registrosPorPagina,
        setRegistrosPorPagina
    ] = useState(10);

    /*
    |--------------------------------------------------------------------------
    | Ordenamiento
    |--------------------------------------------------------------------------
    */

    const [ordenCampo, setOrdenCampo] = useState('id');

    const [
        ordenDireccion,
        setOrdenDireccion
    ] = useState('asc');


    /*
    |--------------------------------------------------------------------------
    | Obtener Tipos de Equipo
    |--------------------------------------------------------------------------
    */

    parametrosListado.current = {
        page: paginaActual,
    };

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
            consultaListado.current?.abort();
        };
    }, []);

    useEffect(() => {
        obtenerTiposEquipo();
        return () => consultaListado.current?.abort();
    }, [paginaActual]);

    const obtenerTiposEquipo = async () => {
        if (!montado.current) {
            return;
        }
        consultaListado.current?.abort();
        const controller = new AbortController();
        consultaListado.current = controller;
        const vigente = () => montado.current
            && consultaListado.current === controller && !controller.signal.aborted;
        setCargando(true);

        try {
            const response = await axios.get(
                '/api/tipos-equipo',
                {
                    params: parametrosListado.current,
                    signal: controller.signal,
                }
            );


            if (!vigente()) {
                return;
            }
            if (Array.isArray(response.data.data)) {
                setTiposEquipo(
                    response.data.data
                );

                setPaginaActual(
                    response.data.current_page ?? 1
                );

                setUltimaPagina(
                    response.data.last_page ?? 1
                );

                setTotalRegistros(
                    response.data.total ?? 0
                );

                setRegistrosPorPagina(
                    response.data.per_page ?? 10
                );

                return;
            }

            setTiposEquipo([]);

            setPaginaActual(1);
            setUltimaPagina(1);
            setTotalRegistros(0);

        } catch (error) {
            if (!vigente() || axios.isCancel(error)) {
                return;
            }
            if (manejarErrorSesion(error)) {
                return;
            }

            console.error(
                'Error al obtener tipos de equipo:',
                error
            );

            mostrarMensaje(
                'No fue posible cargar los tipos de equipo.',
                'danger'
            );

        } finally {
            if (vigente()) {
                setCargando(false);
            }
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Mensajes
    |--------------------------------------------------------------------------
    */

    const mostrarMensaje = (
        texto,
        tipo = 'success'
    ) => {
        setMensaje(texto);
        setTipoMensaje(tipo);

        window.setTimeout(() => {
            setMensaje('');
        }, 4000);
    };


    /*
    |--------------------------------------------------------------------------
    | Nuevo
    |--------------------------------------------------------------------------
    */

    const abrirNuevo = () => {
        if (!(permisos.crear)) {
            return;
        }

        setModoEdicion(false);

        setTipoSeleccionado(null);

        setErrores({});

        setFormulario({
            nombre: '',
            descripcion: '',
        });

        setModalVisible(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Editar
    |--------------------------------------------------------------------------
    */

    const abrirEditar = (tipo) => {
        if (!(permisos.editar)) {
            return;
        }

        setModoEdicion(true);

        setTipoSeleccionado(tipo);

        setErrores({});

        setFormulario({
            nombre: tipo.nombre ?? '',
            descripcion: tipo.descripcion ?? '',
        });

        setModalVisible(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Formulario
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormulario((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errores[name]) {
            setErrores((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Guardar / Actualizar
    |--------------------------------------------------------------------------
    */

    const guardarTipoEquipo = async (e) => {
        e.preventDefault();

        if (!(puedeGuardar && (!modoEdicion || tipoSeleccionado))) {
            return;
        }

        if (!formulario.nombre.trim()) {
            setErrores({ nombre: ['El nombre del tipo de equipo es obligatorio.'] });
            return;
        }

        setGuardando(true);
        setErrores({});

        try {
            await axios.get(
                '/sanctum/csrf-cookie'
            );

            if (modoEdicion) {
                await axios.put(
                    `/api/tipos-equipo/${tipoSeleccionado.id}`,
                    formulario
                );

                mostrarMensaje(
                    'Tipo de equipo actualizado correctamente.'
                );

            } else {
                await axios.post(
                    '/api/tipos-equipo',
                    formulario
                );

                mostrarMensaje(
                    'Tipo de equipo registrado correctamente.'
                );
            }

            setModalVisible(false);

            await obtenerTiposEquipo();

        } catch (error) {
            if (manejarErrorSesion(error)) {
                return;
            }

            console.error(
                'Error al guardar tipo de equipo:',
                error
            );

            if (
                error.response?.status === 422
            ) {
                setErrores(
                    error.response.data.errors ?? {}
                );

                return;
            }

            mostrarMensaje(
                error.response?.data?.message ??
                (error.response?.status === 403
                    ? 'No tienes permiso para realizar esta operación.'
                    : 'No fue posible guardar el tipo de equipo.'),
                'danger'
            );

        } finally {
            setGuardando(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Cambiar estatus
    |--------------------------------------------------------------------------
    */

    const cambiarEstatus = async (tipo) => {
        if (!(permisos.cambiarEstatus && tipo && !bloqueosEstatus.current.has(tipo.id))) {
            return;
        }

        const id = tipo.id;
        bloqueosEstatus.current.add(id);
        setEstatusPendientes(new Set(bloqueosEstatus.current));

        try {
            await axios.get(
                '/sanctum/csrf-cookie'
            );

            await axios.patch(
                `/api/tipos-equipo/${tipo.id}/estatus`
            );

            mostrarMensaje(
                tipo.estatus
                    ? 'Tipo de equipo desactivado correctamente.'
                    : 'Tipo de equipo activado correctamente.'
            );

            await obtenerTiposEquipo();

        } catch (error) {
            if (manejarErrorSesion(error)) {
                return;
            }

            console.error(
                'Error al cambiar estatus:',
                error
            );

            mostrarMensaje(
                error.response?.data?.message ??
                (error.response?.status === 403
                    ? 'No tienes permiso para realizar esta operación.'
                    : 'No fue posible cambiar el estatus.'),
                'danger'
            );
        } finally {
            bloqueosEstatus.current.delete(id);
            if (montado.current) {
                setEstatusPendientes(new Set(bloqueosEstatus.current));
            }
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Confirmar eliminación
    |--------------------------------------------------------------------------
    */

    const confirmarEliminar = (tipo) => {
        if (!(permisos.eliminar)) {
            return;
        }

        setTipoSeleccionado(tipo);

        setModalEliminarVisible(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Eliminar
    |--------------------------------------------------------------------------
    */

    const eliminarTipoEquipo = async () => {
        if (!(permisos.eliminar)) {
            return;
        }

        if (!tipoSeleccionado) {
            return;
        }

        setGuardando(true);

        try {
            await axios.get(
                '/sanctum/csrf-cookie'
            );

            await axios.delete(
                `/api/tipos-equipo/${tipoSeleccionado.id}`
            );

            setModalEliminarVisible(false);

            mostrarMensaje(
                'Tipo de equipo eliminado correctamente.'
            );

            /*
            |--------------------------------------------------------------------------
            | Si eliminamos el último registro de una página
            |--------------------------------------------------------------------------
            */

            if (
                tiposEquipo.length === 1 &&
                paginaActual > 1
            ) {
                setPaginaActual(
                    paginaActual - 1
                );

                return;
            }

            await obtenerTiposEquipo();

        } catch (error) {
            if (manejarErrorSesion(error)) {
                return;
            }

            console.error(
                'Error al eliminar tipo de equipo:',
                error
            );

            mostrarMensaje(
                error.response?.data?.message ??
                (error.response?.status === 403
                    ? 'No tienes permiso para realizar esta operación.'
                    : 'No fue posible eliminar el tipo de equipo.'),
                'danger'
            );

        } finally {
            setGuardando(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Ordenamiento
    |--------------------------------------------------------------------------
    */

    const cambiarOrden = (campo) => {
        if (ordenCampo === campo) {
            setOrdenDireccion(
                ordenDireccion === 'asc'
                    ? 'desc'
                    : 'asc'
            );

            return;
        }

        setOrdenCampo(campo);

        setOrdenDireccion('asc');
    };


    /*
    |--------------------------------------------------------------------------
    | Filtro y ordenamiento
    |--------------------------------------------------------------------------
    */

    const tiposFiltrados = useMemo(() => {
        const texto = busqueda
            .trim()
            .toLowerCase();

        let registros = [
            ...tiposEquipo,
        ];

        if (texto) {
            registros = registros.filter(
                (tipo) => {
                    const nombre =
                        tipo.nombre
                            ?.toLowerCase() ?? '';

                    const descripcion =
                        tipo.descripcion
                            ?.toLowerCase() ?? '';

                    return (
                        nombre.includes(texto) ||
                        descripcion.includes(texto)
                    );
                }
            );
        }

        registros.sort((a, b) => {
            let valorA =
                a[ordenCampo];

            let valorB =
                b[ordenCampo];

            if (
                typeof valorA === 'string'
            ) {
                valorA =
                    valorA.toLowerCase();
            }

            if (
                typeof valorB === 'string'
            ) {
                valorB =
                    valorB.toLowerCase();
            }

            if (valorA < valorB) {
                return ordenDireccion === 'asc'
                    ? -1
                    : 1;
            }

            if (valorA > valorB) {
                return ordenDireccion === 'asc'
                    ? 1
                    : -1;
            }

            return 0;
        });

        return registros;

    }, [
        tiposEquipo,
        busqueda,
        ordenCampo,
        ordenDireccion,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Métricas de página actual
    |--------------------------------------------------------------------------
    */

    const totalActivos =
        tiposEquipo.filter(
            (tipo) =>
                Boolean(tipo.estatus)
        ).length;

    const totalInactivos =
        tiposEquipo.filter(
            (tipo) =>
                !Boolean(tipo.estatus)
        ).length;


    /*
    |--------------------------------------------------------------------------
    | Icono de orden
    |--------------------------------------------------------------------------
    */

    const iconoOrden = (campo) => {
        if (ordenCampo !== campo) {
            return null;
        }

        return (
            <CIcon
                icon={
                    ordenDireccion === 'asc'
                        ? cilArrowTop
                        : cilArrowBottom
                }
                size="sm"
                className="ms-1"
            />
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Páginas visibles
    |--------------------------------------------------------------------------
    */

    const paginasVisibles = useMemo(() => {
        const paginas = [];

        for (
            let pagina = 1;
            pagina <= ultimaPagina;
            pagina++
        ) {
            if (
                pagina === 1 ||
                pagina === ultimaPagina ||
                Math.abs(
                    pagina - paginaActual
                ) <= 2
            ) {
                paginas.push(pagina);
            }
        }

        return paginas;

    }, [
        paginaActual,
        ultimaPagina,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Índices de paginación
    |--------------------------------------------------------------------------
    */

    const registroInicial =
        totalRegistros === 0
            ? 0
            : (
                (paginaActual - 1) *
                registrosPorPagina
            ) + 1;

    const registroFinal =
        Math.min(
            paginaActual *
            registrosPorPagina,
            totalRegistros
        );


    return (
        <>

            {/* Mensajes */}

            {mensaje && (
                <CAlert
                    color={tipoMensaje}
                    dismissible
                    className="py-2"
                    onClose={() =>
                        setMensaje('')
                    }
                >
                    {mensaje}
                </CAlert>
            )}


            {/* Card */}

            <CCard className="catalog-card catalog-view">
                <CatalogHeader title="Tipos de Equipo" description="Clasificación de los equipos del inventario.">
                    {permisos.crear && (
                            <CButton
                                className="btn-vaai d-flex align-items-center gap-2"
                                size="sm"
                                onClick={abrirNuevo}
                            >
                                <CIcon
                                    icon={cilPlus}
                                />

                                Nuevo tipo de equipo
                            </CButton>
                        )}
                </CatalogHeader>

                <CCardHeader className="catalog-toolbar">

                    <CRow className="align-items-center g-3">

                        <CCol
                            xs={12}
                            lg={6}
                        >

                            <div className="catalog-metrics mb-2">Resumen del catálogo · estatus de esta página</div>

                            <div className="d-flex flex-wrap align-items-center gap-3">

                                <span className="small text-body-secondary">

                                    <strong className="text-body">
                                        {totalRegistros}
                                    </strong>{' '}

                                    registros

                                </span>


                                <span className="small d-flex align-items-center">

                                    <span
                                        className="bg-success me-2"
                                        style={{
                                            width: '7px',
                                            height: '7px',
                                            borderRadius: '50%',
                                        }}
                                    />

                                    {totalActivos} activos

                                </span>


                                <span className="small d-flex align-items-center">

                                    <span
                                        className="bg-secondary me-2"
                                        style={{
                                            width: '7px',
                                            height: '7px',
                                            borderRadius: '50%',
                                        }}
                                    />

                                    {totalInactivos} inactivos

                                </span>

                            </div>

                        </CCol>


                        <CCol
                            xs={12}
                            lg={6}
                        >

                            <div className="catalog-tools">

                                <CInputGroup size="sm"
                                >

                                    <CInputGroupText>
                                        <CIcon
                                            icon={cilMagnifyingGlass}
                                        />
                                    </CInputGroupText>

                                    <CFormInput
                                        type="search"
                                        aria-label="Buscar tipos de equipo"
                                        value={busqueda}
                                        placeholder="Buscar nombre o descripción..."
                                        onChange={(e) =>
                                            setBusqueda(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {busqueda && (
                                        <CButton
                                            color="light"
                                            className="border"
                                            title="Limpiar búsqueda"
                                            onClick={() =>
                                                setBusqueda('')
                                            }
                                        >
                                            <CIcon
                                                icon={cilX}
                                                size="sm"
                                            />
                                        </CButton>
                                    )}

                                </CInputGroup>


                                <CButton
                                    color="light"
                                    size="sm"
                                    className="border"
                                    title="Actualizar registros"
                                    onClick={
                                        obtenerTiposEquipo
                                    }
                                >
                                    <CIcon
                                        icon={cilReload}
                                    />
                                </CButton>

                            </div>

                        </CCol>

                    </CRow>

                </CCardHeader>


                <CCardBody className="p-0">

                    {cargando ? (

                        <CatalogLoading />

                    ) : tiposFiltrados.length === 0 ? (

                        <CatalogEmptyState filtered={Boolean(busqueda)}>
{busqueda && (
                                <CButton
                                    color="light"
                                    size="sm"
                                    className="border"
                                    onClick={() =>
                                        setBusqueda('')
                                    }
                                >
                                    Limpiar búsqueda
                                </CButton>
                            )}

                        </CatalogEmptyState>

                    ) : (

                        <div className="table-responsive">

                            <CTable
                                hover
                                small
                                align="middle"
                                className="mb-0 catalog-table"
                            >

                                <CTableHead>

                                    <CTableRow>

                                        <CTableHeaderCell
                                            className="ps-3"
                                            style={{
                                                width: '65px',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="catalog-sort-button"
                                                onClick={() =>
                                                    cambiarOrden(
                                                        'id'
                                                    )
                                                }
                                            >
                                                ID
                                                {iconoOrden(
                                                    'id'
                                                )}
                                            </button>
                                        </CTableHeaderCell>


                                        <CTableHeaderCell
                                            style={{
                                                width: '205px',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="catalog-sort-button"
                                                onClick={() =>
                                                    cambiarOrden(
                                                        'nombre'
                                                    )
                                                }
                                            >
                                                Tipo de Equipo

                                                {iconoOrden(
                                                    'nombre'
                                                )}
                                            </button>
                                        </CTableHeaderCell>


                                        <CTableHeaderCell>
                                            Descripción
                                        </CTableHeaderCell>


                                        <CTableHeaderCell
                                            className="text-center"
                                            style={{
                                                width: '110px',
                                            }}
                                        >
                                            Estatus
                                        </CTableHeaderCell>


                                        {mostrarAcciones && (
                                            <CTableHeaderCell
                                                className="text-center"
                                                style={{
                                                    width: '125px',
                                                }}
                                            >
                                                Acciones
                                            </CTableHeaderCell>
                                        )}

                                    </CTableRow>

                                </CTableHead>


                                <CTableBody>

                                    {tiposFiltrados.map(
                                        (tipo) => (

                                            <CTableRow
                                                key={tipo.id}
                                            >

                                                <CTableDataCell className="ps-3">

                                                    <span className="catalog-id">
                                                        {String(
                                                            tipo.id
                                                        ).padStart(
                                                            2,
                                                            '0'
                                                        )}
                                                    </span>

                                                </CTableDataCell>


                                                <CTableDataCell>

                                                    <div className="d-flex align-items-center gap-2">

                                                        <div className="catalog-type-icon">

                                                            <CIcon
                                                                icon={cilDescription}
                                                                size="sm"
                                                            />

                                                        </div>

                                                        <div className="catalog-name text-body">
                                                            {tipo.nombre}
                                                        </div>

                                                    </div>

                                                </CTableDataCell>


                                                <CTableDataCell>

                                                    <span className="catalog-description">

                                                        {tipo.descripcion || (
                                                            <span className="fst-italic">
                                                                Sin descripción
                                                            </span>
                                                        )}

                                                    </span>

                                                </CTableDataCell>


                                                <CTableDataCell>

                                                    <div className="text-center"><StatusBadge active={tipo.estatus} /></div>

                                                </CTableDataCell>


                                                {mostrarAcciones && (
                                                    <CTableDataCell>

                                                        <div className="catalog-actions">

                                                            {permisos.editar && (
                                                                <CButton
                                                                    color="primary"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title="Editar"
                                                                    className="catalog-action-button"
                                                                    onClick={() =>
                                                                        abrirEditar(
                                                                            tipo
                                                                        )
                                                                    }
                                                                >
                                                                    <CIcon
                                                                        icon={cilPencil}
                                                                        size="sm"
                                                                    />
                                                                </CButton>
                                                            )}


                                                            {permisos.cambiarEstatus && (
                                                                <CButton
                                                                    color={
                                                                        tipo.estatus
                                                                            ? 'warning'
                                                                            : 'success'
                                                                    }
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={estatusPendientes.has(tipo.id)}
                                                                    title={
                                                                        tipo.estatus
                                                                            ? 'Desactivar'
                                                                            : 'Activar'
                                                                    }
                                                                    className="catalog-action-button"
                                                                    onClick={() =>
                                                                        cambiarEstatus(
                                                                            tipo
                                                                        )
                                                                    }
                                                                >
                                                                    <CIcon
                                                                        icon={
                                                                            tipo.estatus
                                                                                ? cilXCircle
                                                                                : cilCheckCircle
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </CButton>
                                                            )}


                                                            {permisos.eliminar && (
                                                                <CButton
                                                                    color="danger"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title="Eliminar"
                                                                    className="catalog-action-button"
                                                                    onClick={() =>
                                                                        confirmarEliminar(
                                                                            tipo
                                                                        )
                                                                    }
                                                                >
                                                                    <CIcon
                                                                        icon={cilTrash}
                                                                        size="sm"
                                                                    />
                                                                </CButton>
                                                            )}

                                                        </div>

                                                    </CTableDataCell>
                                                )}

                                            </CTableRow>

                                        )
                                    )}

                                </CTableBody>

                            </CTable>

                        </div>

                    )}

                </CCardBody>


                {/* Paginación */}

                {totalRegistros > 0 && (

                    <div className="catalog-pagination">

                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">

                            <div className="small text-body-secondary">

                                Mostrando{' '}

                                <strong>
                                    {registroInicial}
                                </strong>

                                {' '}a{' '}

                                <strong>
                                    {registroFinal}
                                </strong>

                                {' '}de{' '}

                                <strong>
                                    {totalRegistros}
                                </strong>

                                {' '}registros
                                <span className="catalog-page-number">Página {paginaActual} de {ultimaPagina}</span>
                            </div>


                            {ultimaPagina > 1 && (

                                <CPagination
                                    size="sm"
                                    className="mb-0"
                                    aria-label="Paginación de tipos de equipo"
                                >

                                    {/* Primera */}

                                    <CPaginationItem
                                        disabled={
                                            paginaActual === 1
                                        }
                                        title="Primera página"
                                        onClick={() =>
                                            setPaginaActual(1)
                                        }
                                    >
                                        «
                                    </CPaginationItem>


                                    {/* Anterior */}

                                    <CPaginationItem
                                        disabled={
                                            paginaActual === 1
                                        }
                                        onClick={() =>
                                            setPaginaActual(
                                                paginaActual - 1
                                            )
                                        }
                                    >
                                        Anterior
                                    </CPaginationItem>


                                    {/* Números */}

                                    {paginasVisibles.map(
                                        (
                                            pagina,
                                            index
                                        ) => {

                                            const anterior =
                                                paginasVisibles[
                                                    index - 1
                                                ];

                                            return (
                                                <React.Fragment
                                                    key={
                                                        pagina
                                                    }
                                                >

                                                    {anterior &&
                                                        pagina -
                                                            anterior >
                                                            1 && (

                                                            <CPaginationItem
                                                                disabled
                                                            >
                                                                …
                                                            </CPaginationItem>

                                                        )}

                                                    <CPaginationItem
                                                        active={
                                                            pagina ===
                                                            paginaActual
                                                        }
                                                        onClick={() =>
                                                            setPaginaActual(
                                                                pagina
                                                            )
                                                        }
                                                    >
                                                        {pagina}
                                                    </CPaginationItem>

                                                </React.Fragment>
                                            );

                                        }
                                    )}


                                    {/* Siguiente */}

                                    <CPaginationItem
                                        disabled={
                                            paginaActual ===
                                            ultimaPagina
                                        }
                                        onClick={() =>
                                            setPaginaActual(
                                                paginaActual + 1
                                            )
                                        }
                                    >
                                        Siguiente
                                    </CPaginationItem>


                                    {/* Última */}

                                    <CPaginationItem
                                        disabled={
                                            paginaActual ===
                                            ultimaPagina
                                        }
                                        title="Última página"
                                        onClick={() =>
                                            setPaginaActual(
                                                ultimaPagina
                                            )
                                        }
                                    >
                                        »
                                    </CPaginationItem>

                                </CPagination>

                            )}

                        </div>

                    </div>

                )}

            </CCard>


            {/* Modal Nuevo / Editar */}

            {puedeGuardar && (
                <CModal
                    alignment="center"
                    visible={modalVisible}
                    onClose={() =>
                        setModalVisible(false)
                    }
                    backdrop="static"
                >

                    <CForm
                        onSubmit={
                            guardarTipoEquipo
                        }
                        noValidate
                    >

                        <CModalHeader>

                            <CModalTitle>
                                {modoEdicion
                                    ? 'Editar Tipo de Equipo'
                                    : 'Nuevo Tipo de Equipo'}
                            </CModalTitle>

                        </CModalHeader>


                        <CModalBody>

                            <div className="mb-3">

                                <CFormLabel htmlFor="nombre">
                                    Nombre

                                    <span className="text-danger ms-1">
                                        *
                                    </span>
                                </CFormLabel>

                                <CFormInput
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    value={
                                        formulario.nombre
                                    }
                                    placeholder="Ej. Laptop"
                                    maxLength={100}
                                    required
                                    invalid={
                                        Boolean(
                                            errores.nombre
                                        )
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                {errores.nombre && (
                                    <div className="invalid-feedback d-block">
                                        {
                                            errores
                                                .nombre[0]
                                        }
                                    </div>
                                )}

                            </div>


                            <div>

                                <CFormLabel htmlFor="descripcion">
                                    Descripción
                                </CFormLabel>

                                <CFormTextarea
                                    id="descripcion"
                                    name="descripcion"
                                    rows={3}
                                    value={
                                        formulario.descripcion
                                    }
                                    placeholder="Descripción del tipo de equipo"
                                    invalid={
                                        Boolean(
                                            errores.descripcion
                                        )
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                {errores.descripcion && (
                                    <div className="invalid-feedback d-block">
                                        {
                                            errores
                                                .descripcion[0]
                                        }
                                    </div>
                                )}

                            </div>

                        </CModalBody>


                        <CModalFooter>

                            <CButton
                                color="secondary"
                                variant="outline"
                                disabled={
                                    guardando
                                }
                                onClick={() =>
                                    setModalVisible(
                                        false
                                    )
                                }
                            >
                                Cancelar
                            </CButton>


                            <CButton
                                type="submit"
                                className="btn-vaai"
                                disabled={
                                    guardando
                                }
                            >

                                {guardando && (
                                    <CSpinner
                                        size="sm"
                                        className="me-2"
                                    />
                                )}

                                {guardando
                                    ? 'Guardando...'
                                    : modoEdicion
                                        ? 'Actualizar'
                                        : 'Guardar'}

                            </CButton>

                        </CModalFooter>

                    </CForm>

                </CModal>
            )}


            {/* Modal Eliminar */}

            {permisos.eliminar && (
                <CModal
                    alignment="center"
                    visible={
                        modalEliminarVisible
                    }
                    onClose={() =>
                        setModalEliminarVisible(
                            false
                        )
                    }
                    backdrop="static"
                >

                    <CModalHeader>

                        <CModalTitle>
                            Eliminar Tipo de Equipo
                        </CModalTitle>

                    </CModalHeader>


                    <CModalBody>

                        <p className="mb-2">
                            ¿Estás seguro de eliminar el siguiente tipo de equipo?
                        </p>


                        {tipoSeleccionado && (

                            <div className="rounded border bg-body-tertiary p-3">

                                <strong>
                                    {
                                        tipoSeleccionado
                                            .nombre
                                    }
                                </strong>

                                {tipoSeleccionado
                                    .descripcion && (

                                    <div className="small text-body-secondary mt-1">
                                        {
                                            tipoSeleccionado
                                                .descripcion
                                        }
                                    </div>

                                )}

                            </div>

                        )}


                        <p className="small text-danger mt-3 mb-0">
                            Esta acción no se puede deshacer.
                        </p>

                    </CModalBody>


                    <CModalFooter>

                        <CButton
                            color="secondary"
                            variant="outline"
                            disabled={
                                guardando
                            }
                            onClick={() =>
                                setModalEliminarVisible(
                                    false
                                )
                            }
                        >
                            Cancelar
                        </CButton>


                        <CButton
                            color="danger"
                            disabled={
                                guardando
                            }
                            onClick={
                                eliminarTipoEquipo
                            }
                        >

                            {guardando && (
                                <CSpinner
                                    size="sm"
                                    className="me-2"
                                />
                            )}

                            {guardando
                                ? 'Eliminando...'
                                : 'Eliminar'}

                        </CButton>

                    </CModalFooter>

                </CModal>
            )}

        </>
    );
}

export default TiposEquipo;

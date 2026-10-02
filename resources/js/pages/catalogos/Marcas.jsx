import { CatalogHeader, StatusBadge, CatalogLoading, CatalogEmptyState } from '../../components/catalogos/CatalogPresentation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import usePermisos from '../../hooks/usePermisos';
import useAuth from '../../hooks/useAuth';

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

function Marcas() {
    const montado = useRef(false);
    const consultaListado = useRef(null);
    const parametrosListado = useRef(null);
    const bloqueosEstatus = useRef(new Set());
    const [estatusPendientes, setEstatusPendientes] = useState(new Set());
    const { manejarErrorSesion } = useAuth();
    const permisos = usePermisos('marcas');
    const mostrarAcciones = permisos.editar || permisos.cambiarEstatus || permisos.eliminar;

    const [marcas, setMarcas] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [busqueda, setBusqueda] = useState('');

    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('success');

    const [modalVisible, setModalVisible] = useState(false);

    const [
        modalEstatusVisible,
        setModalEstatusVisible
    ] = useState(false);

    const [
        modalEliminarVisible,
        setModalEliminarVisible
    ] = useState(false);

    const [modoEdicion, setModoEdicion] = useState(false);

    const [
        marcaSeleccionada,
        setMarcaSeleccionada
    ] = useState(null);

    const [formulario, setFormulario] = useState({
        nombre: '',
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
    | Obtener Marcas
    |--------------------------------------------------------------------------
    */

    parametrosListado.current = {
        page: paginaActual,
        buscar: busqueda.trim() || undefined,
    };

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
            consultaListado.current?.abort();
        };
    }, []);

    useEffect(() => {
        const temporizador = window.setTimeout(() => {
            obtenerMarcas();
        }, 300);

        return () => {
            window.clearTimeout(temporizador);
            consultaListado.current?.abort();
        };
    }, [paginaActual, busqueda]);


    const obtenerMarcas = async () => {

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
                '/api/marcas',
                {
                    params: parametrosListado.current,
                    signal: controller.signal,
                }
            );


            if (!vigente()) {
                return;
            }
            /*
            |--------------------------------------------------------------------------
            | El controlador de Marcas devuelve:
            |
            | {
            |     success: true,
            |     data: {
            |         current_page: 1,
            |         data: [...]
            |     }
            | }
            |--------------------------------------------------------------------------
            */

            const paginacion = response.data.data;

            if (
                paginacion &&
                Array.isArray(paginacion.data)
            ) {

                setMarcas(
                    paginacion.data
                );

                setPaginaActual(
                    paginacion.current_page ?? 1
                );

                setUltimaPagina(
                    paginacion.last_page ?? 1
                );

                setTotalRegistros(
                    paginacion.total ?? 0
                );

                setRegistrosPorPagina(
                    paginacion.per_page ?? 10
                );

                return;
            }

            setMarcas([]);
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
                'Error al obtener marcas:',
                error
            );

            mostrarMensaje(
                error.response?.data?.message ??
                'No fue posible cargar las marcas.',
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
    | Nueva Marca
    |--------------------------------------------------------------------------
    */

    const abrirNuevo = () => {
        if (!(permisos.crear)) {
            return;
        }


        setModoEdicion(false);

        setMarcaSeleccionada(null);

        setErrores({});

        setFormulario({
            nombre: '',
        });

        setModalVisible(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Editar Marca
    |--------------------------------------------------------------------------
    */

    const abrirEditar = (marca) => {
        if (!(permisos.editar)) {
            return;
        }


        setModoEdicion(true);

        setMarcaSeleccionada(marca);

        setErrores({});

        setFormulario({
            nombre: marca.nombre ?? '',
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

    const guardarMarca = async (e) => {

        e.preventDefault();

        if (!(puedeGuardar && (!modoEdicion || marcaSeleccionada))) {
            return;
        }

        if (!formulario.nombre.trim()) {
            setErrores({ nombre: ['El nombre de la marca es obligatorio.'] });
            return;
        }

        setGuardando(true);
        setErrores({});

        try {

            await axios.get(
                '/sanctum/csrf-cookie'
            );

            if (modoEdicion) {

                const response = await axios.put(
                    `/api/marcas/${marcaSeleccionada.id}`,
                    formulario
                );

                mostrarMensaje(
                    response.data?.message ??
                    'Marca actualizada correctamente.'
                );

            } else {

                const response = await axios.post(
                    '/api/marcas',
                    formulario
                );

                mostrarMensaje(
                    response.data?.message ??
                    'Marca registrada correctamente.'
                );
            }

            setModalVisible(false);

            await obtenerMarcas();

        } catch (error) {
            if (manejarErrorSesion(error)) {
                return;
            }


            console.error(
                'Error al guardar marca:',
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
                    : 'No fue posible guardar la marca.'),
                'danger'
            );

        } finally {

            setGuardando(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Cambiar Estatus
    |--------------------------------------------------------------------------
    */

    const solicitarCambioEstatus = (marca) => {
        if (!(permisos.cambiarEstatus && marca && !bloqueosEstatus.current.has(marca.id))) {
            return;
        }

        if (!marca.estatus) {
            cambiarEstatus(marca);
            return;
        }

        setMarcaSeleccionada(marca);
        setModalEstatusVisible(true);
    };

    const cambiarEstatus = async (marca) => {
        if (!(permisos.cambiarEstatus && marca && !bloqueosEstatus.current.has(marca.id))) {
            return;
        }




        const id = marca.id;
        bloqueosEstatus.current.add(id);
        setEstatusPendientes(new Set(bloqueosEstatus.current));

        try {

            await axios.get(
                '/sanctum/csrf-cookie'
            );

            const response = await axios.patch(
                `/api/marcas/${marca.id}/estatus`
            );

            mostrarMensaje(
                response.data?.message ??
                (marca.estatus
                    ? 'Marca desactivada correctamente.'
                    : 'Marca activada correctamente.')
            );

            setModalEstatusVisible(false);
            setMarcaSeleccionada(null);

            await obtenerMarcas();

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
    | Confirmar Eliminación
    |--------------------------------------------------------------------------
    */

    const confirmarEliminar = (marca) => {
        if (!(permisos.eliminar)) {
            return;
        }


        setMarcaSeleccionada(marca);

        setModalEliminarVisible(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Eliminar
    |--------------------------------------------------------------------------
    */

    const eliminarMarca = async () => {
        if (!(permisos.eliminar)) {
            return;
        }


        if (!marcaSeleccionada) {
            return;
        }

        setGuardando(true);

        try {

            await axios.get(
                '/sanctum/csrf-cookie'
            );

            await axios.delete(
                `/api/marcas/${marcaSeleccionada.id}`
            );

            setModalEliminarVisible(false);

            mostrarMensaje(
                'Marca eliminada correctamente.'
            );

            if (
                marcas.length === 1 &&
                paginaActual > 1
            ) {

                setPaginaActual(
                    paginaActual - 1
                );

                return;
            }

            await obtenerMarcas();

        } catch (error) {
            if (manejarErrorSesion(error)) {
                return;
            }


            console.error(
                'Error al eliminar marca:',
                error
            );

            mostrarMensaje(
                error.response?.data?.message ??
                (error.response?.status === 403
                    ? 'No tienes permiso para realizar esta operación.'
                    : 'No fue posible eliminar la marca.'),
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
    | Filtro y Ordenamiento
    |--------------------------------------------------------------------------
    */

    const marcasFiltradas = useMemo(() => {

        let registros = [
            ...marcas,
        ];

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
        marcas,
        ordenCampo,
        ordenDireccion,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Métricas de Página Actual
    |--------------------------------------------------------------------------
    */

    const totalActivos =
        marcas.filter(
            (marca) =>
                Boolean(marca.estatus)
        ).length;

    const totalInactivos =
        marcas.filter(
            (marca) =>
                !Boolean(marca.estatus)
        ).length;


    /*
    |--------------------------------------------------------------------------
    | Icono de Orden
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
    | Páginas Visibles
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
    | Índices de Paginación
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
                <CatalogHeader title="Marcas" description="Marcas registradas para identificar los equipos.">
                    {permisos.crear && (
                            <CButton
                                className="btn-vaai d-flex align-items-center gap-2"
                                size="sm"
                                onClick={abrirNuevo}
                            >

                                <CIcon
                                    icon={cilPlus}
                                />

                                Nueva marca

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
                                        aria-label="Buscar marcas"
                                        value={busqueda}
                                        placeholder="Buscar marca..."
                                        onChange={(e) => {
                                            setBusqueda(e.target.value);
                                            setPaginaActual(1);
                                        }}
                                    />


                                    {busqueda && (

                                        <CButton
                                            color="light"
                                            className="border"
                                            title="Limpiar búsqueda"
                                            onClick={() => {
                                                setBusqueda('');
                                                setPaginaActual(1);
                                            }}
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
                                        obtenerMarcas
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

                    ) : marcasFiltradas.length === 0 ? (

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


                                        <CTableHeaderCell>

                                            <button
                                                type="button"
                                                className="catalog-sort-button"
                                                onClick={() =>
                                                    cambiarOrden(
                                                        'nombre'
                                                    )
                                                }
                                            >
                                                Marca

                                                {iconoOrden(
                                                    'nombre'
                                                )}

                                            </button>

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

                                    {marcasFiltradas.map(
                                        (marca) => (

                                            <CTableRow
                                                key={marca.id}
                                            >

                                                <CTableDataCell className="ps-3">

                                                    <span className="catalog-id">

                                                        {String(
                                                            marca.id
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
                                                            {marca.nombre}
                                                        </div>

                                                    </div>

                                                </CTableDataCell>


                                                <CTableDataCell>

                                                    <div className="text-center"><StatusBadge active={marca.estatus} /></div>

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
                                                                            marca
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
                                                                        marca.estatus
                                                                            ? 'warning'
                                                                            : 'success'
                                                                    }
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={estatusPendientes.has(marca.id)}
                                                                    title={
                                                                        marca.estatus
                                                                            ? 'Desactivar'
                                                                            : 'Activar'
                                                                    }
                                                                    className="catalog-action-button"
                                                                    onClick={() =>
                                                                        solicitarCambioEstatus(
                                                                            marca
                                                                        )
                                                                    }
                                                                >

                                                                    <CIcon
                                                                        icon={
                                                                            marca.estatus
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
                                                                            marca
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
                                    aria-label="Paginación de marcas"
                                >

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
                                                    key={pagina}
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


            {/* Modal Nueva / Editar Marca */}

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
                            guardarMarca
                        }
                        noValidate
                    >

                        <CModalHeader>

                            <CModalTitle>

                                {modoEdicion
                                    ? 'Editar Marca'
                                    : 'Nueva Marca'}

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
                                    placeholder="Ej. Dell"
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
                                        {errores.nombre[0]}
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


            {/* Confirmación para desactivar */}

            {permisos.cambiarEstatus && (
                <CModal
                    alignment="center"
                    visible={modalEstatusVisible}
                    onClose={() => {
                        setModalEstatusVisible(false);
                        setMarcaSeleccionada(null);
                    }}
                    backdrop="static"
                >

                    <CModalHeader>
                        <CModalTitle>
                            Desactivar Marca
                        </CModalTitle>
                    </CModalHeader>

                    <CModalBody>
                        <p className="mb-2">
                            ¿Estás seguro de desactivar esta marca?
                        </p>

                        {marcaSeleccionada && (
                            <div className="rounded border bg-body-tertiary p-3">
                                <strong>
                                    {marcaSeleccionada.nombre}
                                </strong>
                            </div>
                        )}

                        <p className="small text-body-secondary mt-3 mb-0">
                            La marca permanecerá registrada y podrá activarse nuevamente.
                        </p>
                    </CModalBody>

                    <CModalFooter>
                        <CButton
                            color="secondary"
                            variant="outline"
                            disabled={estatusPendientes.has(marcaSeleccionada?.id)}
                            onClick={() => {
                                setModalEstatusVisible(false);
                                setMarcaSeleccionada(null);
                            }}
                        >
                            Cancelar
                        </CButton>

                        <CButton
                            color="warning"
                            disabled={estatusPendientes.has(marcaSeleccionada?.id) || !marcaSeleccionada}
                            onClick={() => cambiarEstatus(marcaSeleccionada)}
                        >
                            {estatusPendientes.has(marcaSeleccionada?.id) && (
                                <CSpinner
                                    size="sm"
                                    className="me-2"
                                />
                            )}

                            {estatusPendientes.has(marcaSeleccionada?.id) ? 'Desactivando...' : 'Desactivar'}
                        </CButton>
                    </CModalFooter>

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
                            Eliminar Marca
                        </CModalTitle>

                    </CModalHeader>


                    <CModalBody>

                        <p className="mb-2">
                            ¿Estás seguro de eliminar la siguiente marca?
                        </p>


                        {marcaSeleccionada && (

                            <div className="rounded border bg-body-tertiary p-3">

                                <strong>
                                    {
                                        marcaSeleccionada
                                            .nombre
                                    }
                                </strong>

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
                                eliminarMarca
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

export default Marcas;

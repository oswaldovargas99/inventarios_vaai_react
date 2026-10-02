import React, { useEffect, useMemo, useState } from 'react';
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
    cilCheckCircle,
    cilDescription,
    cilMagnifyingGlass,
    cilPencil,
    cilPlus,
    cilReload,
    cilTrash,
    cilXCircle,
} from '@coreui/icons';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

function TiposEquipo() {

    /*
    |--------------------------------------------------------------------------
    | Estados
    |--------------------------------------------------------------------------
    */

    const [tiposEquipo, setTiposEquipo] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [busqueda, setBusqueda] = useState('');

    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState('success');

    const [modalVisible, setModalVisible] = useState(false);
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false);

    const [modoEdicion, setModoEdicion] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: '',
    });

    const [errores, setErrores] = useState({});

    const [paginaActual, setPaginaActual] = useState(1);
    const [ultimaPagina, setUltimaPagina] = useState(1);


    /*
    |--------------------------------------------------------------------------
    | Obtener Tipos de Equipo
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        obtenerTiposEquipo();
    }, [paginaActual]);

    const obtenerTiposEquipo = async () => {

        setCargando(true);

        try {

            const response = await axios.get('/api/tipos-equipo', {
                params: {
                    page: paginaActual,
                },
            });

            /*
            |--------------------------------------------------------------------------
            | Respuesta como arreglo
            |--------------------------------------------------------------------------
            */

            if (Array.isArray(response.data)) {

                setTiposEquipo(response.data);
                setUltimaPagina(1);

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | Respuesta paginada de Laravel
            |--------------------------------------------------------------------------
            */

            if (Array.isArray(response.data.data)) {

                setTiposEquipo(response.data.data);

                setUltimaPagina(
                    response.data.last_page ?? 1
                );

                return;
            }


            setTiposEquipo([]);
            setUltimaPagina(1);

        } catch (error) {

            console.error(
                'Error al obtener tipos de equipo:',
                error
            );

            mostrarMensaje(
                'No fue posible cargar los tipos de equipo.',
                'danger'
            );

        } finally {

            setCargando(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Mensajes
    |--------------------------------------------------------------------------
    */

    const mostrarMensaje = (texto, tipo = 'success') => {

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

        setGuardando(true);
        setErrores({});

        try {

            await axios.get('/sanctum/csrf-cookie');

            if (
                modoEdicion &&
                tipoSeleccionado
            ) {

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

            console.error(
                'Error al guardar tipo de equipo:',
                error
            );

            if (error.response?.status === 422) {

                setErrores(
                    error.response.data.errors ?? {}
                );

                return;
            }

            mostrarMensaje(
                error.response?.data?.message ??
                'No fue posible guardar el tipo de equipo.',
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

        try {

            await axios.get('/sanctum/csrf-cookie');

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

            console.error(
                'Error al cambiar estatus:',
                error
            );

            mostrarMensaje(
                error.response?.data?.message ??
                'No fue posible cambiar el estatus.',
                'danger'
            );

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Confirmar eliminación
    |--------------------------------------------------------------------------
    */

    const confirmarEliminar = (tipo) => {

        setTipoSeleccionado(tipo);
        setModalEliminarVisible(true);
    };


    /*
    |--------------------------------------------------------------------------
    | Eliminar
    |--------------------------------------------------------------------------
    */

    const eliminarTipoEquipo = async () => {

        if (!tipoSeleccionado) {
            return;
        }

        setGuardando(true);

        try {

            await axios.get('/sanctum/csrf-cookie');

            await axios.delete(
                `/api/tipos-equipo/${tipoSeleccionado.id}`
            );

            setModalEliminarVisible(false);

            mostrarMensaje(
                'Tipo de equipo eliminado correctamente.'
            );

            await obtenerTiposEquipo();

        } catch (error) {

            console.error(
                'Error al eliminar tipo de equipo:',
                error
            );

            mostrarMensaje(
                error.response?.data?.message ??
                'No fue posible eliminar el tipo de equipo.',
                'danger'
            );

        } finally {

            setGuardando(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | Filtro
    |--------------------------------------------------------------------------
    */

    const tiposFiltrados = useMemo(() => {

        const texto = busqueda
            .trim()
            .toLowerCase();

        if (!texto) {
            return tiposEquipo;
        }

        return tiposEquipo.filter((tipo) => {

            const nombre =
                tipo.nombre?.toLowerCase() ?? '';

            const descripcion =
                tipo.descripcion?.toLowerCase() ?? '';

            return (
                nombre.includes(texto) ||
                descripcion.includes(texto)
            );
        });

    }, [
        tiposEquipo,
        busqueda,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>

            {/* =============================================================
                ENCABEZADO
            ============================================================= */}

            <CRow className="mb-3">

                <CCol>

                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">

                        <div>

                            <h2 className="page-title mb-1">
                                Tipos de Equipo
                            </h2>

                            <p className="page-subtitle mb-0">
                                Administración del catálogo de tipos de equipo.
                            </p>

                        </div>


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

                    </div>

                </CCol>

            </CRow>


            {/* =============================================================
                MENSAJES
            ============================================================= */}

            {mensaje && (

                <CAlert
                    color={tipoMensaje}
                    dismissible
                    className="py-2"
                    onClose={() => setMensaje('')}
                >
                    {mensaje}
                </CAlert>

            )}


            {/* =============================================================
                CARD PRINCIPAL
            ============================================================= */}

            <CCard>

                <CCardHeader className="bg-body py-2">

                    <CRow className="align-items-center g-2">

                        <CCol
                            xs={12}
                            md={6}
                        >

                            <div className="fw-semibold small">
                                Catálogo de Tipos de Equipo
                            </div>

                            <div className="text-body-secondary"
                                style={{
                                    fontSize: '0.75rem',
                                }}
                            >
                                {tiposEquipo.length} registros encontrados
                            </div>

                        </CCol>


                        <CCol
                            xs={12}
                            md={6}
                        >

                            <div className="d-flex justify-content-md-end gap-2">

                                <CInputGroup
                                    size="sm"
                                    style={{
                                        maxWidth: '260px',
                                    }}
                                >

                                    <CInputGroupText>

                                        <CIcon
                                            icon={cilMagnifyingGlass}
                                        />

                                    </CInputGroupText>


                                    <CFormInput
                                        type="search"
                                        value={busqueda}
                                        placeholder="Buscar..."
                                        onChange={(e) =>
                                            setBusqueda(e.target.value)
                                        }
                                    />

                                </CInputGroup>


                                <CButton
                                    color="light"
                                    size="sm"
                                    className="border"
                                    title="Actualizar"
                                    onClick={obtenerTiposEquipo}
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

                        /*
                        |--------------------------------------------------------------------------
                        | Cargando
                        |--------------------------------------------------------------------------
                        */

                        <div className="d-flex flex-column align-items-center justify-content-center py-4">

                            <CSpinner
                                color="primary"
                                size="sm"
                            />

                            <span className="mt-2 small text-body-secondary">
                                Cargando tipos de equipo...
                            </span>

                        </div>

                    ) : tiposFiltrados.length === 0 ? (

                        /*
                        |--------------------------------------------------------------------------
                        | Sin registros
                        |--------------------------------------------------------------------------
                        */

                        <div className="text-center py-4">

                            <CIcon
                                icon={cilDescription}
                                size="xl"
                                className="text-body-tertiary mb-2"
                            />

                            <h6 className="fw-semibold">
                                No se encontraron registros
                            </h6>

                            <p className="small text-body-secondary mb-0">
                                No existen tipos de equipo que coincidan con la búsqueda.
                            </p>

                        </div>

                    ) : (

                        /*
                        |--------------------------------------------------------------------------
                        | Tabla compacta
                        |--------------------------------------------------------------------------
                        */

                        <div className="table-responsive">

                            <CTable
                                hover
                                small
                                align="middle"
                                className="mb-0"
                            >

                                <CTableHead>

                                    <CTableRow>

                                        <CTableHeaderCell
                                            scope="col"
                                            className="ps-3"
                                            style={{
                                                width: '55px',
                                            }}
                                        >
                                            #
                                        </CTableHeaderCell>


                                        <CTableHeaderCell
                                            scope="col"
                                            style={{
                                                width: '185px',
                                            }}
                                        >
                                            Tipo de Equipo
                                        </CTableHeaderCell>


                                        <CTableHeaderCell scope="col">
                                            Descripción
                                        </CTableHeaderCell>


                                        <CTableHeaderCell
                                            scope="col"
                                            className="text-center"
                                            style={{
                                                width: '100px',
                                            }}
                                        >
                                            Estatus
                                        </CTableHeaderCell>


                                        <CTableHeaderCell
                                            scope="col"
                                            className="text-center"
                                            style={{
                                                width: '135px',
                                            }}
                                        >
                                            Acciones
                                        </CTableHeaderCell>

                                    </CTableRow>

                                </CTableHead>


                                <CTableBody>

                                    {tiposFiltrados.map((tipo) => (

                                        <CTableRow key={tipo.id}>

                                            {/* ID */}

                                            <CTableDataCell className="ps-3 text-body-secondary">
                                                {tipo.id}
                                            </CTableDataCell>


                                            {/* Nombre */}

                                            <CTableDataCell>

                                                <div className="fw-semibold">
                                                    {tipo.nombre}
                                                </div>

                                            </CTableDataCell>


                                            {/* Descripción */}

                                            <CTableDataCell className="text-body-secondary">

                                                {tipo.descripcion || (

                                                    <span className="fst-italic">
                                                        Sin descripción
                                                    </span>

                                                )}

                                            </CTableDataCell>


                                            {/* Estatus */}

                                            <CTableDataCell className="text-center">

                                                <CBadge
                                                    color={
                                                        tipo.estatus
                                                            ? 'success'
                                                            : 'secondary'
                                                    }
                                                    shape="rounded-pill"
                                                    className="px-2 py-1"
                                                >
                                                    {tipo.estatus
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </CBadge>

                                            </CTableDataCell>


                                            {/* Acciones */}

                                            <CTableDataCell>

                                                <div className="d-flex align-items-center justify-content-center gap-1">

                                                    {/* Editar */}

                                                    <CButton
                                                        color="primary"
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Editar"
                                                        onClick={() =>
                                                            abrirEditar(tipo)
                                                        }
                                                    >

                                                        <CIcon
                                                            icon={cilPencil}
                                                            size="sm"
                                                        />

                                                    </CButton>


                                                    {/* Activar / Desactivar */}

                                                    <CButton
                                                        color={
                                                            tipo.estatus
                                                                ? 'warning'
                                                                : 'success'
                                                        }
                                                        variant="ghost"
                                                        size="sm"
                                                        title={
                                                            tipo.estatus
                                                                ? 'Desactivar'
                                                                : 'Activar'
                                                        }
                                                        onClick={() =>
                                                            cambiarEstatus(tipo)
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


                                                    {/* Eliminar */}

                                                    <CButton
                                                        color="danger"
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Eliminar"
                                                        onClick={() =>
                                                            confirmarEliminar(tipo)
                                                        }
                                                    >

                                                        <CIcon
                                                            icon={cilTrash}
                                                            size="sm"
                                                        />

                                                    </CButton>

                                                </div>

                                            </CTableDataCell>

                                        </CTableRow>

                                    ))}

                                </CTableBody>

                            </CTable>

                        </div>

                    )}

                </CCardBody>


                {/* =========================================================
                    PAGINACIÓN
                ========================================================= */}

                {ultimaPagina > 1 && (

                    <div className="border-top px-3 py-2">

                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">

                            <span className="small text-body-secondary">
                                Página {paginaActual} de {ultimaPagina}
                            </span>


                            <CPagination
                                size="sm"
                                className="mb-0"
                                aria-label="Paginación"
                            >

                                <CPaginationItem
                                    disabled={paginaActual <= 1}
                                    onClick={() =>
                                        setPaginaActual(
                                            Math.max(
                                                paginaActual - 1,
                                                1
                                            )
                                        )
                                    }
                                >
                                    Anterior
                                </CPaginationItem>


                                {Array.from(
                                    {
                                        length: ultimaPagina,
                                    },
                                    (_, index) => index + 1
                                ).map((pagina) => (

                                    <CPaginationItem
                                        key={pagina}
                                        active={
                                            pagina === paginaActual
                                        }
                                        onClick={() =>
                                            setPaginaActual(pagina)
                                        }
                                    >
                                        {pagina}
                                    </CPaginationItem>

                                ))}


                                <CPaginationItem
                                    disabled={
                                        paginaActual >= ultimaPagina
                                    }
                                    onClick={() =>
                                        setPaginaActual(
                                            Math.min(
                                                paginaActual + 1,
                                                ultimaPagina
                                            )
                                        )
                                    }
                                >
                                    Siguiente
                                </CPaginationItem>

                            </CPagination>

                        </div>

                    </div>

                )}

            </CCard>


            {/* =============================================================
                MODAL NUEVO / EDITAR
            ============================================================= */}

            <CModal
                alignment="center"
                visible={modalVisible}
                onClose={() =>
                    setModalVisible(false)
                }
                backdrop="static"
            >

                <CForm onSubmit={guardarTipoEquipo}>

                    <CModalHeader>

                        <CModalTitle>
                            {modoEdicion
                                ? 'Editar Tipo de Equipo'
                                : 'Nuevo Tipo de Equipo'}
                        </CModalTitle>

                    </CModalHeader>


                    <CModalBody>

                        {/* Nombre */}

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
                                value={formulario.nombre}
                                placeholder="Ej. Laptop"
                                maxLength={100}
                                invalid={
                                    Boolean(errores.nombre)
                                }
                                onChange={handleChange}
                            />

                            {errores.nombre && (

                                <div className="invalid-feedback d-block">
                                    {errores.nombre[0]}
                                </div>

                            )}

                        </div>


                        {/* Descripción */}

                        <div>

                            <CFormLabel htmlFor="descripcion">
                                Descripción
                            </CFormLabel>

                            <CFormTextarea
                                id="descripcion"
                                name="descripcion"
                                rows={3}
                                value={formulario.descripcion}
                                placeholder="Descripción del tipo de equipo"
                                invalid={
                                    Boolean(errores.descripcion)
                                }
                                onChange={handleChange}
                            />

                            {errores.descripcion && (

                                <div className="invalid-feedback d-block">
                                    {errores.descripcion[0]}
                                </div>

                            )}

                        </div>

                    </CModalBody>


                    <CModalFooter>

                        <CButton
                            color="secondary"
                            variant="outline"
                            disabled={guardando}
                            onClick={() =>
                                setModalVisible(false)
                            }
                        >
                            Cancelar
                        </CButton>


                        <CButton
                            type="submit"
                            className="btn-vaai"
                            disabled={guardando}
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


            {/* =============================================================
                MODAL ELIMINAR
            ============================================================= */}

            <CModal
                alignment="center"
                visible={modalEliminarVisible}
                onClose={() =>
                    setModalEliminarVisible(false)
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
                                {tipoSeleccionado.nombre}
                            </strong>


                            {tipoSeleccionado.descripcion && (

                                <div className="small text-body-secondary mt-1">
                                    {tipoSeleccionado.descripcion}
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
                        disabled={guardando}
                        onClick={() =>
                            setModalEliminarVisible(false)
                        }
                    >
                        Cancelar
                    </CButton>


                    <CButton
                        color="danger"
                        disabled={guardando}
                        onClick={eliminarTipoEquipo}
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

        </>
    );
}

export default TiposEquipo;
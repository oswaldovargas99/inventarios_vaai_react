import React, { useState } from 'react';
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
    CRow,
} from '@coreui/react';
import CentroUniversitarioSelector, {
    etiquetaCentroUniversitario,
} from '../../components/CentroUniversitarioSelector';
import { crearUsuario } from '../../services/usuarios';

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
    password: 'La contraseña es obligatoria.',
    password_confirmation: 'La confirmación de contraseña es obligatoria.',
};

const formularioInicial = {
    codigo: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    id_centro_universitario: '',
    rol_id: '',
    password: '',
    password_confirmation: '',
};

function RegistrarUsuario() {
    const [formulario, setFormulario] = useState(formularioInicial);
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [textoCentro, setTextoCentro] = useState('');

    const cambiarCampo = (event) => {
        const { name, value } = event.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
        if (errores[name]) setErrores((actual) => ({ ...actual, [name]: undefined }));
    };

    const cambiarCentro = (valor) => {
        setTextoCentro(valor);
        setFormulario((actual) => ({ ...actual, id_centro_universitario: '' }));
        if (errores.id_centro_universitario) {
            setErrores((actual) => ({ ...actual, id_centro_universitario: undefined }));
        }
    };

    const seleccionarCentro = (centro) => {
        setFormulario((actual) => ({ ...actual, id_centro_universitario: String(centro.id) }));
        setTextoCentro(etiquetaCentroUniversitario(centro));
        if (errores.id_centro_universitario) {
            setErrores((actual) => ({ ...actual, id_centro_universitario: undefined }));
        }
    };

    const registrar = async (event) => {
        event.preventDefault();
        if (guardando) return;

        const erroresFormulario = Object.fromEntries(
            Object.keys(mensajesObligatorios)
                .filter((campo) => !String(formulario[campo] ?? '').trim())
                .map((campo) => [campo, [mensajesObligatorios[campo]]]),
        );

        if (textoCentro.trim() && !formulario.id_centro_universitario) {
            erroresFormulario.id_centro_universitario = [
                'Selecciona un centro universitario de la lista de sugerencias.',
            ];
        }

        if (formulario.password && formulario.password_confirmation && formulario.password !== formulario.password_confirmation) {
            erroresFormulario.password = ['Las contraseñas no coinciden.'];
        } else if (formulario.password && formulario.password.length < 8) {
            erroresFormulario.password = ['La contraseña debe tener al menos 8 caracteres.'];
        }

        if (Object.keys(erroresFormulario).length) {
            setErrores(erroresFormulario);
            setMensaje({ color: 'danger', texto: 'Completa los campos obligatorios antes de registrar el usuario.' });
            return;
        }

        setGuardando(true);
        setMensaje(null);
        setErrores({});
        try {
            const respuesta = await crearUsuario({
                ...formulario,
                id_centro_universitario: formulario.id_centro_universitario || null,
            });
            setMensaje({ color: 'success', texto: respuesta.message });
            setFormulario(formularioInicial);
            setTextoCentro('');
        } catch (error) {
            setErrores(error.response?.data?.errors ?? {});
            setMensaje({ color: 'danger', texto: error.response?.data?.message ?? 'No fue posible registrar el usuario.' });
        } finally {
            setGuardando(false);
        }
    };

    const errorDe = (campo) => errores[campo]?.[0];
    const esObligatorio = (campo) => Object.prototype.hasOwnProperty.call(mensajesObligatorios, campo);

    return (
        <CCard className="catalog-card catalog-view">
            <CCardHeader>
                <strong>Registrar usuario</strong>
                <div className="small text-body-secondary">Incorpora un nuevo usuario al sistema</div>
            </CCardHeader>
            <CCardBody>
                {mensaje && <CAlert color={mensaje.color}>{mensaje.texto}</CAlert>}
                <CForm onSubmit={registrar} noValidate>
                    <CRow className="g-3">
                        {[
                            ['codigo', 'Código', 'text'],
                            ['nombre', 'Nombre', 'text'],
                            ['apellido_paterno', 'Apellido paterno', 'text'],
                            ['apellido_materno', 'Apellido materno', 'text'],
                            ['email', 'Correo electrónico', 'email'],
                        ].map(([campo, etiqueta, tipo]) => (
                            <CCol md={6} key={campo}>
                                <CFormLabel htmlFor={`usuario-${campo}`}>
                                    {etiqueta}
                                    {esObligatorio(campo) && <span className="text-danger ms-1">*</span>}
                                </CFormLabel>
                                <CFormInput
                                    id={`usuario-${campo}`}
                                    name={campo}
                                    type={tipo}
                                    value={formulario[campo]}
                                    onChange={cambiarCampo}
                                    required={esObligatorio(campo)}
                                    invalid={Boolean(errorDe(campo))}
                                    disabled={guardando}
                                />
                                {errorDe(campo) && <div className="invalid-feedback d-block">{errorDe(campo)}</div>}
                            </CCol>
                        ))}
                        <CCol md={6}>
                            <CentroUniversitarioSelector
                                id="usuario-centro-universitario"
                                value={textoCentro}
                                onChange={cambiarCentro}
                                onSelect={seleccionarCentro}
                                seleccionado={Boolean(formulario.id_centro_universitario)}
                                invalid={Boolean(errorDe('id_centro_universitario'))}
                                error={errorDe('id_centro_universitario')}
                                disabled={guardando}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="usuario-rol">
                                Rol
                                <span className="text-danger ms-1">*</span>
                            </CFormLabel>
                            <CFormSelect
                                id="usuario-rol"
                                name="rol_id"
                                value={formulario.rol_id}
                                onChange={cambiarCampo}
                                required
                                invalid={Boolean(errorDe('rol_id'))}
                                disabled={guardando}
                            >
                                <option value="">Selecciona un rol</option>
                                {roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
                            </CFormSelect>
                            {errorDe('rol_id') && <div className="invalid-feedback d-block">{errorDe('rol_id')}</div>}
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="usuario-contrasena">
                                Contraseña
                                <span className="text-danger ms-1">*</span>
                            </CFormLabel>
                            <CFormInput
                                id="usuario-contrasena"
                                name="password"
                                type="password"
                                value={formulario.password}
                                onChange={cambiarCampo}
                                required
                                invalid={Boolean(errorDe('password'))}
                                disabled={guardando}
                            />
                            {errorDe('password') && <div className="invalid-feedback d-block">{errorDe('password')}</div>}
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel htmlFor="usuario-confirmacion">
                                Confirmar contraseña
                                <span className="text-danger ms-1">*</span>
                            </CFormLabel>
                            <CFormInput
                                id="usuario-confirmacion"
                                name="password_confirmation"
                                type="password"
                                value={formulario.password_confirmation}
                                onChange={cambiarCampo}
                                required
                                invalid={Boolean(errorDe('password_confirmation'))}
                                disabled={guardando}
                            />
                            {errorDe('password_confirmation') && <div className="invalid-feedback d-block">{errorDe('password_confirmation')}</div>}
                        </CCol>
                    </CRow>
                    <div className="d-flex justify-content-end mt-4">
                        <CButton type="submit" className="btn-vaai" disabled={guardando}>
                            {guardando ? 'Registrando...' : 'Registrar usuario'}
                        </CButton>
                    </div>
                </CForm>
            </CCardBody>
        </CCard>
    );
}

export default RegistrarUsuario;

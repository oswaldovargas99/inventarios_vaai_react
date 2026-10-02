import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

function Login() {
    const navigate = useNavigate();

    const [codigo, setCodigo] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMensaje('');
        setCargando(true);

        try {
            await axios.get('/sanctum/csrf-cookie');

            const response = await axios.post('/api/login', {
                codigo,
                password,
            });

            if (response.data?.success) {
                navigate('/dashboard', {
                    replace: true,
                });
            }

        } catch (error) {
            console.error('Error al iniciar sesión:', error);

            if (error.response?.data?.errors) {
                const primerError = Object.values(
                    error.response.data.errors
                )[0];

                setMensaje(
                    Array.isArray(primerError)
                        ? primerError[0]
                        : 'No fue posible iniciar sesión.'
                );

                return;
            }

            if (error.response?.data?.message) {
                setMensaje(error.response.data.message);
                return;
            }

            setMensaje(
                'No fue posible conectar con el servidor.'
            );

        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f8fa]">

            <div className="flex min-h-screen items-center justify-center px-4 py-10">

                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[0.9fr_1.1fr]">

                    {/* Panel izquierdo */}
                    <div className="hidden bg-[#eef4f6] p-12 lg:flex lg:flex-col lg:justify-between">

                        <div>

                            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="h-7 w-7"
                                >
                                    <path d="M4 5h16v14H4z" />
                                    <path d="M8 9h8" />
                                    <path d="M8 13h5" />
                                    <path d="M8 17h7" />
                                </svg>

                            </div>

                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                VAAI
                            </p>

                            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-800">
                                Sistema de Inventarios
                            </h1>

                            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
                                Plataforma para el registro, consulta y seguimiento
                                de equipos y bienes de forma organizada y segura.
                            </p>


                            <div className="mt-10 space-y-4">

                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            Acceso seguro
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Autenticación con código de trabajador.
                                        </p>
                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            Gestión por roles
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Permisos de acceso según el perfil asignado.
                                        </p>
                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            Información centralizada
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Consulta de información desde un solo sistema.
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="border-t border-slate-200 pt-6">
                            <p className="text-xs leading-5 text-slate-500">
                                Acceso exclusivo para usuarios autorizados.
                            </p>
                        </div>

                    </div>


                    {/* Panel Login */}
                    <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">

                        <div className="w-full max-w-md">

                            {/* Encabezado móvil */}
                            <div className="mb-8 lg:hidden">

                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef4f6] text-slate-600">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-6 w-6"
                                    >
                                        <path d="M4 5h16v14H4z" />
                                        <path d="M8 9h8" />
                                        <path d="M8 13h5" />
                                        <path d="M8 17h7" />
                                    </svg>

                                </div>

                                <h1 className="text-xl font-bold text-slate-800">
                                    Inventarios VAAI
                                </h1>

                            </div>


                            <div className="mb-8">

                                <p className="text-sm font-medium text-[#6f8f9f]">
                                    Bienvenido
                                </p>

                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
                                    Iniciar sesión
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Ingresa tus credenciales para acceder al sistema.
                                </p>

                            </div>


                            {/* Error */}
                            {mensaje && (
                                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {mensaje}
                                </div>
                            )}


                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* Código */}
                                <div>

                                    <label
                                        htmlFor="codigo"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Código de trabajador
                                    </label>

                                    <div className="relative">

                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-5 w-5"
                                            >
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M4 21a8 8 0 0 1 16 0" />
                                            </svg>

                                        </div>

                                        <input
                                            id="codigo"
                                            name="codigo"
                                            type="text"
                                            value={codigo}
                                            onChange={(e) =>
                                                setCodigo(e.target.value)
                                            }
                                            placeholder="Ingresa tu código"
                                            autoComplete="username"
                                            maxLength={20}
                                            required
                                            disabled={cargando}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition focus:border-[#8eabb8] focus:bg-white focus:ring-4 focus:ring-[#8eabb8]/15 disabled:cursor-not-allowed disabled:opacity-60"
                                        />

                                    </div>

                                </div>


                                {/* Contraseña */}
                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <label
                                            htmlFor="password"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Contraseña
                                        </label>

                                        <Link
                                            to="/recuperar-password"
                                            className="text-xs font-medium text-[#6f8f9f] transition hover:text-slate-700 hover:underline"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>

                                    </div>


                                    <div className="relative">

                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-5 w-5"
                                            >
                                                <rect
                                                    x="3"
                                                    y="11"
                                                    width="18"
                                                    height="10"
                                                    rx="2"
                                                />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>

                                        </div>

                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                mostrarPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="Ingresa tu contraseña"
                                            autoComplete="current-password"
                                            required
                                            disabled={cargando}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-800 outline-none transition focus:border-[#8eabb8] focus:bg-white focus:ring-4 focus:ring-[#8eabb8]/15 disabled:cursor-not-allowed disabled:opacity-60"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMostrarPassword(
                                                    !mostrarPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-600"
                                            aria-label={
                                                mostrarPassword
                                                    ? 'Ocultar contraseña'
                                                    : 'Mostrar contraseña'
                                            }
                                        >

                                            {mostrarPassword ? (

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    className="h-5 w-5"
                                                >
                                                    <path d="m3 3 18 18" />
                                                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                    <path d="M9.9 4.2A10 10 0 0 1 12 4c6 0 9 8 9 8a16.6 16.6 0 0 1-2 3" />
                                                    <path d="M6.5 6.5C3.8 8.2 3 12 3 12s3 8 9 8a9.8 9.8 0 0 0 4.1-.9" />
                                                </svg>

                                            ) : (

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    className="h-5 w-5"
                                                >
                                                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="3"
                                                    />
                                                </svg>

                                            )}

                                        </button>

                                    </div>

                                </div>


                                {/* Botón */}
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className="flex w-full items-center justify-center rounded-xl bg-[#7d9eac] px-5 py-3.5 font-semibold text-white transition hover:bg-[#6e8f9c] focus:outline-none focus:ring-4 focus:ring-[#7d9eac]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {cargando
                                        ? 'Validando acceso...'
                                        : 'Iniciar sesión'}
                                </button>

                            </form>


                            {/* Registro */}
                            <div className="mt-8 rounded-xl bg-slate-50 px-4 py-4 text-center">

                                <p className="text-sm text-slate-500">
                                    ¿No tienes una cuenta?{' '}

                                    <Link
                                        to="/registro"
                                        className="font-semibold text-[#6f8f9f] transition hover:text-slate-700 hover:underline"
                                    >
                                        Registrarse
                                    </Link>
                                </p>

                            </div>


                            {/* Privacidad */}
                            <div className="mt-6 text-center">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarPrivacidad(true)
                                    }
                                    className="text-xs text-slate-400 transition hover:text-slate-600 hover:underline"
                                >
                                    Aviso de privacidad
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* Modal de privacidad */}
            {mostrarPrivacidad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Aviso de privacidad
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Sistema de Inventarios VAAI
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                                aria-label="Cerrar"
                            >
                                ×
                            </button>

                        </div>


                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

                            <p className="text-sm leading-7 text-slate-600">
                                La información proporcionada para ingresar al
                                Sistema de Inventarios VAAI será utilizada para
                                identificar y autenticar a las personas usuarias
                                autorizadas y registrar las operaciones realizadas
                                dentro de la plataforma.
                            </p>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                El aviso institucional definitivo deberá
                                incorporarse antes de la puesta en producción
                                del sistema.
                            </p>

                        </div>


                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="rounded-lg bg-[#7d9eac] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6e8f9c]"
                            >
                                Entendido
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Login;
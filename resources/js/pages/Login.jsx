import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [codigo, setCodigo] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMensaje('');

        if (!codigo.trim() || !password) {
            setMensaje(!codigo.trim()
                ? 'El código de trabajador es obligatorio.'
                : 'La contraseña es obligatoria.');
            return;
        }

        setCargando(true);

        try {
            const usuario = await login({
                codigo,
                password,
            });

            if (usuario) {
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
        <div className="min-h-screen bg-slate-100">

            <div className="flex min-h-screen items-center justify-center px-4 py-10">

                <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-[380px_1fr]">

                    {/* =========================================================
                        PANEL IZQUIERDO
                    ========================================================= */}

                    <div className="hidden bg-[#456b86] p-10 text-white lg:flex lg:flex-col lg:justify-between">

                        <div>

                            {/* Logo / Icono */}
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="h-7 w-7"
                                >
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                    <path d="m3.3 7 8.7 5 8.7-5" />
                                    <path d="M12 22V12" />
                                </svg>

                            </div>


                            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">
                                VAAI
                            </p>


                            <h1 className="mt-3 text-3xl font-bold leading-tight">
                                Sistema de
                                <br />
                                Inventarios
                            </h1>


                            <p className="mt-5 text-sm leading-7 text-blue-50/90">
                                Administración y control de los bienes,
                                equipos y recursos institucionales.
                            </p>


                            {/* Características */}
                            <div className="mt-10 space-y-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">

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

                                    <span className="text-sm text-blue-50">
                                        Control de inventario
                                    </span>

                                </div>


                                <div className="flex items-center gap-3">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">

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

                                    <span className="text-sm text-blue-50">
                                        Administración por roles
                                    </span>

                                </div>


                                <div className="flex items-center gap-3">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">

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

                                    <span className="text-sm text-blue-50">
                                        Información centralizada
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* Pie panel */}
                        <div className="border-t border-white/20 pt-6">

                            <p className="text-xs leading-5 text-blue-100">
                                Acceso exclusivo para usuarios autorizados.
                            </p>

                        </div>

                    </div>


                    {/* =========================================================
                        PANEL LOGIN
                    ========================================================= */}

                    <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">

                        <div className="w-full max-w-md">

                            {/* Encabezado */}
                            <div className="mb-9">

                                {/* Logo móvil */}
                                <div className="mb-6 flex items-center gap-3 lg:hidden">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#456b86] text-white">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            className="h-6 w-6"
                                        >
                                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                            <path d="m3.3 7 8.7 5 8.7-5" />
                                            <path d="M12 22V12" />
                                        </svg>

                                    </div>

                                    <span className="font-bold text-slate-800">
                                        Inventarios VAAI
                                    </span>

                                </div>


                                <p className="text-sm font-semibold text-[#527895]">
                                    Bienvenido
                                </p>

                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
                                    Iniciar sesión
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Ingresa tus credenciales para acceder al sistema.
                                </p>

                            </div>


                            {/* =====================================================
                                MENSAJE DE ERROR
                            ===================================================== */}

                            {mensaje && (
                                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="mt-0.5 h-5 w-5 shrink-0"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 8v4" />
                                        <path d="M12 16h.01" />
                                    </svg>

                                    <span>
                                        {mensaje}
                                    </span>

                                </div>
                            )}


                            {/* =====================================================
                                FORMULARIO
                            ===================================================== */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                                noValidate
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
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6b8da5] focus:ring-4 focus:ring-[#6b8da5]/10 disabled:bg-slate-100"
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
                                            className="text-xs font-semibold text-[#527895] transition hover:text-[#3f627b] hover:underline"
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
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#6b8da5] focus:ring-4 focus:ring-[#6b8da5]/10 disabled:bg-slate-100"
                                        />


                                        {/* Mostrar / Ocultar contraseña */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMostrarPassword(
                                                    !mostrarPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-[#527895]"
                                            aria-label={
                                                mostrarPassword
                                                    ? 'Ocultar contraseña'
                                                    : 'Mostrar contraseña'
                                            }
                                            title={
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


                                {/* =================================================
                                    BOTÓN LOGIN
                                ================================================= */}

                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#527895] px-5 py-3.5 font-semibold text-white transition hover:bg-[#456b86] focus:outline-none focus:ring-4 focus:ring-[#527895]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {cargando ? (
                                        <>
                                            <svg
                                                className="h-5 w-5 animate-spin"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />

                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                                                />
                                            </svg>

                                            Validando acceso...
                                        </>
                                    ) : (
                                        <>
                                            Iniciar sesión

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-5 w-5"
                                            >
                                                <path d="M5 12h14" />
                                                <path d="m13 6 6 6-6 6" />
                                            </svg>
                                        </>
                                    )}

                                </button>

                            </form>


                            {/* =====================================================
                                REGISTRO
                            ===================================================== */}

                            <div className="mt-8 border-t border-slate-200 pt-6">

                                <p className="text-center text-sm text-slate-500">
                                    ¿No tienes una cuenta?{' '}

                                    <Link
                                        to="/registro"
                                        className="font-semibold text-[#527895] transition hover:text-[#3f627b] hover:underline"
                                    >
                                        Registrarse
                                    </Link>
                                </p>

                            </div>


                            {/* =====================================================
                                PRIVACIDAD
                            ===================================================== */}

                            <div className="mt-5 text-center">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarPrivacidad(true)
                                    }
                                    className="text-xs font-medium text-slate-400 transition hover:text-[#527895] hover:underline"
                                >
                                    Aviso de privacidad
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =============================================================
                MODAL AVISO DE PRIVACIDAD
            ============================================================= */}

            {mostrarPrivacidad && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Encabezado */}
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
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
                                aria-label="Cerrar"
                            >
                                ×
                            </button>

                        </div>


                        {/* Contenido */}
                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

                            <p className="text-sm leading-7 text-slate-600">
                                La información proporcionada para ingresar al
                                Sistema de Inventarios VAAI será utilizada para
                                identificar y autenticar a las personas usuarias
                                autorizadas, así como para registrar las
                                operaciones realizadas dentro de la plataforma.
                            </p>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                El aviso institucional definitivo deberá
                                incorporarse antes de la puesta en producción
                                del sistema.
                            </p>

                        </div>


                        {/* Pie */}
                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="rounded-lg bg-[#527895] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#456b86]"
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

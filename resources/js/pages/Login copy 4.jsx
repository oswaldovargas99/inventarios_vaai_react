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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

            {/* Figuras decorativas */}
            <div className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>

            <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-3xl"></div>

            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>


            {/* Contenido */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

                <div className="w-full max-w-6xl">

                    <div className="grid items-center gap-12 lg:grid-cols-2">


                        {/* Panel izquierdo */}
                        <div className="hidden text-white lg:block">

                            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">

                                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>

                                <span className="text-sm text-slate-300">
                                    Sistema disponible
                                </span>

                            </div>


                            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight">
                                Control inteligente de
                                <span className="block text-blue-400">
                                    inventarios VAAI
                                </span>
                            </h1>


                            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                                Gestiona equipos, movimientos, responsables
                                y catálogos desde una plataforma centralizada
                                y segura.
                            </p>


                            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">

                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
                                            <path d="m9 12 2 2 4-4" />
                                        </svg>

                                    </div>

                                    <p className="font-semibold text-white">
                                        Acceso seguro
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Autenticación y control por perfiles.
                                    </p>

                                </div>


                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">

                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <rect x="3" y="4" width="18" height="16" rx="2" />
                                            <path d="M7 8h10" />
                                            <path d="M7 12h6" />
                                            <path d="M7 16h8" />
                                        </svg>

                                    </div>

                                    <p className="font-semibold text-white">
                                        Gestión centralizada
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Información organizada en un solo lugar.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Tarjeta Login */}
                        <div className="flex justify-center">

                            <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

                                {/* Encabezado */}
                                <div className="mb-8">

                                    <div className="mb-5 flex items-center justify-between">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">

                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-6 w-6"
                                            >
                                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                                <path d="m3.3 7 8.7 5 8.7-5" />
                                                <path d="M12 22V12" />
                                            </svg>

                                        </div>

                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                            VAAI
                                        </span>

                                    </div>


                                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                        Bienvenido
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Ingresa tus credenciales para continuar.
                                    </p>

                                </div>


                                {/* Error */}
                                {mensaje && (
                                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                        <div className="flex gap-3">

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

                                            <span>{mensaje}</span>

                                        </div>

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
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />

                                        </div>

                                    </div>


                                    {/* Password */}
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
                                                className="text-xs font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
                                            >
                                                ¿La olvidaste?
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
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMostrarPassword(
                                                        !mostrarPassword
                                                    )
                                                }
                                                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-blue-700"
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
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>

                                                )}

                                            </button>

                                        </div>

                                    </div>


                                    {/* Botón */}
                                    <button
                                        type="submit"
                                        disabled={cargando}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
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

                                                Ingresando...
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


                                {/* Registro */}
                                <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-center">

                                    <p className="text-sm text-slate-500">
                                        ¿Aún no tienes acceso?
                                    </p>

                                    <Link
                                        to="/registro"
                                        className="mt-1 inline-block text-sm font-bold text-blue-700 transition hover:text-blue-900 hover:underline"
                                    >
                                        Crear una cuenta
                                    </Link>

                                </div>


                                {/* Privacidad */}
                                <div className="mt-6 text-center">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMostrarPrivacidad(true)
                                        }
                                        className="text-xs font-medium text-slate-400 transition hover:text-blue-700 hover:underline"
                                    >
                                        Aviso de privacidad
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* Modal Aviso */}
            {mostrarPrivacidad && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
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
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                                aria-label="Cerrar"
                            >
                                <span className="text-xl">
                                    ×
                                </span>
                            </button>

                        </div>


                        <div className="max-h-[60vh] overflow-y-auto px-6 py-6">

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


                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
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
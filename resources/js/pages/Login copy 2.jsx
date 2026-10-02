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
        <div className="relative min-h-screen bg-slate-100">

            {/* Fondo superior */}
            <div className="absolute left-0 top-0 h-80 w-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900"></div>

            {/* Decoración */}
            <div className="absolute left-10 top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>

            <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"></div>


            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">

                {/* Encabezado */}
                <div className="mb-8 text-center text-white">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-lg backdrop-blur">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-8 w-8"
                        >
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                        </svg>

                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Inventarios VAAI
                    </h1>

                    <p className="mt-2 text-sm text-slate-300">
                        Sistema de administración y control de inventarios
                    </p>

                </div>


                {/* Tarjeta Login */}
                <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">

                    <div className="mb-8">

                        <h2 className="text-2xl font-bold text-slate-900">
                            Iniciar sesión
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Ingresa tus credenciales para acceder al sistema.
                        </p>

                    </div>


                    {/* Mensaje */}
                    {mensaje && (
                        <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

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
                                    placeholder="Ej. 1000001"
                                    autoComplete="username"
                                    maxLength={20}
                                    disabled={cargando}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                                >
                                    Recuperar contraseña
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
                                    disabled={cargando}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarPassword(
                                            !mostrarPassword
                                        )
                                    }
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-blue-600"
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


                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={cargando}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
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

                                    Validando...
                                </>
                            ) : (
                                <>
                                    Ingresar al sistema

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
                    <div className="mt-8">

                        <div className="relative">

                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>

                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-xs text-slate-400">
                                    ¿Eres nuevo en el sistema?
                                </span>
                            </div>

                        </div>


                        <Link
                            to="/registro"
                            className="mt-6 flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                        >
                            Crear una cuenta
                        </Link>

                    </div>


                    {/* Privacidad */}
                    <div className="mt-8 text-center">

                        <button
                            type="button"
                            onClick={() =>
                                setMostrarPrivacidad(true)
                            }
                            className="text-xs font-medium text-slate-500 transition hover:text-blue-600 hover:underline"
                        >
                            Aviso de privacidad
                        </button>

                        <p className="mt-3 text-[11px] leading-5 text-slate-400">
                            El acceso al sistema está reservado para usuarios autorizados.
                        </p>

                    </div>

                </div>


                {/* Pie */}
                <p className="mt-8 text-center text-xs text-slate-500">
                    Inventarios VAAI
                </p>

            </div>


            {/* Modal de privacidad */}
            {mostrarPrivacidad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

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
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </svg>
                            </button>

                        </div>


                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

                            <p className="text-sm leading-7 text-slate-600">
                                La información utilizada para ingresar al
                                Sistema de Inventarios VAAI será tratada con
                                la finalidad de identificar y autenticar a
                                las personas usuarias autorizadas, así como
                                registrar las operaciones realizadas dentro
                                de la plataforma.
                            </p>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                El aviso institucional definitivo deberá
                                incorporarse en este apartado antes de la
                                puesta en producción del sistema.
                            </p>

                        </div>


                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Cerrar
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Login;
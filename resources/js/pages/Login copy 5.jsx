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
        <div className="min-h-screen bg-slate-100">

            <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">

                <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[1fr_420px]">

                    {/* Panel principal */}
                    <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">

                        <div className="w-full max-w-md">

                            {/* Identidad */}
                            <div className="mb-10">

                                <div className="mb-5 flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-6 w-6"
                                        >
                                            <rect
                                                x="4"
                                                y="4"
                                                width="16"
                                                height="16"
                                                rx="2"
                                            />
                                            <path d="M8 8h8" />
                                            <path d="M8 12h8" />
                                            <path d="M8 16h5" />
                                        </svg>

                                    </div>

                                    <div>
                                        <h1 className="text-xl font-bold text-slate-900">
                                            Inventarios VAAI
                                        </h1>

                                        <p className="text-xs text-slate-500">
                                            Sistema de gestión de inventarios
                                        </p>
                                    </div>

                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Acceso al sistema
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Ingresa tu código de trabajador y contraseña
                                    para continuar.
                                </p>

                            </div>


                            {/* Error */}
                            {mensaje && (
                                <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                                        disabled={cargando}
                                        required
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
                                    />

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
                                            className="text-xs font-medium text-blue-700 hover:underline"
                                        >
                                            Recuperar contraseña
                                        </Link>

                                    </div>


                                    <div className="relative">

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
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMostrarPassword(
                                                    !mostrarPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-blue-700"
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
                                    className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {cargando
                                        ? 'Validando acceso...'
                                        : 'Iniciar sesión'}
                                </button>

                            </form>


                            {/* Registro */}
                            <div className="mt-8 border-t border-slate-200 pt-6">

                                <p className="text-center text-sm text-slate-500">
                                    ¿No tienes una cuenta?{' '}

                                    <Link
                                        to="/registro"
                                        className="font-semibold text-blue-700 hover:underline"
                                    >
                                        Registrarse
                                    </Link>
                                </p>

                            </div>


                            {/* Privacidad */}
                            <div className="mt-5 text-center">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarPrivacidad(true)
                                    }
                                    className="text-xs text-slate-500 hover:text-blue-700 hover:underline"
                                >
                                    Aviso de privacidad
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* Panel lateral */}
                    <aside className="hidden bg-blue-700 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">

                        <div>

                            <span className="inline-flex rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
                                VAAI
                            </span>

                            <h3 className="mt-6 text-3xl font-bold leading-tight">
                                Gestión confiable del inventario institucional
                            </h3>

                            <p className="mt-5 text-sm leading-7 text-blue-100">
                                Plataforma para registrar, consultar y dar
                                seguimiento a los bienes y equipos bajo
                                responsabilidad de la VAAI.
                            </p>


                            <div className="mt-10 space-y-5">

                                <div className="flex gap-3">

                                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-3.5 w-3.5"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                    </span>

                                    <p className="text-sm leading-6 text-blue-50">
                                        Control de acceso mediante roles.
                                    </p>

                                </div>


                                <div className="flex gap-3">

                                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-3.5 w-3.5"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                    </span>

                                    <p className="text-sm leading-6 text-blue-50">
                                        Información centralizada y organizada.
                                    </p>

                                </div>


                                <div className="flex gap-3">

                                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-3.5 w-3.5"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                    </span>

                                    <p className="text-sm leading-6 text-blue-50">
                                        Seguimiento de operaciones y movimientos.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="border-t border-white/15 pt-6">

                            <p className="text-xs leading-5 text-blue-100">
                                Acceso exclusivo para personal autorizado.
                            </p>

                        </div>

                    </aside>

                </div>

            </div>


            {/* Modal privacidad */}
            {mostrarPrivacidad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <h3 className="text-lg font-bold text-slate-900">
                                Aviso de privacidad
                            </h3>

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
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
                                className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
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
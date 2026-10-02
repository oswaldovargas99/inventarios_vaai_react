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
        <div className="min-h-screen bg-slate-50">

            {/* Barra superior */}
            <div className="h-2 bg-blue-700"></div>

            <div className="flex min-h-[calc(100vh-8px)] flex-col">

                {/* Encabezado */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-6 w-6"
                                >
                                    <path d="M4 6h16" />
                                    <path d="M4 12h16" />
                                    <path d="M4 18h16" />
                                </svg>

                            </div>

                            <div>
                                <h1 className="text-lg font-bold text-slate-900">
                                    Inventarios VAAI
                                </h1>

                                <p className="text-xs text-slate-500">
                                    Sistema institucional de control de inventarios
                                </p>
                            </div>

                        </div>

                        <span className="hidden text-sm text-slate-400 sm:block">
                            Acceso seguro
                        </span>

                    </div>
                </header>


                {/* Contenido */}
                <main className="flex flex-1 items-center justify-center px-4 py-10">

                    <div className="w-full max-w-5xl">

                        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">

                            {/* Panel informativo */}
                            <div className="hidden bg-slate-100 p-12 lg:block">

                                <div className="flex h-full flex-col justify-between">

                                    <div>

                                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                            Plataforma VAAI
                                        </span>

                                        <h2 className="mt-6 text-4xl font-bold leading-tight text-slate-900">
                                            Control y seguimiento del inventario
                                        </h2>

                                        <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                                            Administra de forma centralizada la información
                                            de equipos, bienes y movimientos del inventario.
                                        </p>

                                        <div className="mt-10 space-y-5">

                                            <div className="flex items-start gap-4">

                                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">

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
                                                    <p className="font-semibold text-slate-800">
                                                        Acceso controlado
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Autenticación mediante código de trabajador.
                                                    </p>
                                                </div>

                                            </div>


                                            <div className="flex items-start gap-4">

                                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">

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
                                                    <p className="font-semibold text-slate-800">
                                                        Gestión por roles
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Acceso diferenciado según el perfil del usuario.
                                                    </p>
                                                </div>

                                            </div>


                                            <div className="flex items-start gap-4">

                                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">

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
                                                    <p className="font-semibold text-slate-800">
                                                        Información centralizada
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Consulta y administración desde un solo sistema.
                                                    </p>
                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    <p className="text-xs text-slate-400">
                                        Sistema de Inventarios VAAI
                                    </p>

                                </div>

                            </div>


                            {/* Login */}
                            <div className="p-8 sm:p-10 lg:p-12">

                                <div className="mx-auto max-w-md">

                                    <div className="mb-8">

                                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                                            Acceso
                                        </p>

                                        <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                            Iniciar sesión
                                        </h2>

                                        <p className="mt-3 text-sm leading-6 text-slate-500">
                                            Ingresa tu código de trabajador y contraseña.
                                        </p>

                                    </div>


                                    {mensaje && (
                                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                                                placeholder="Ej. 1000001"
                                                autoComplete="username"
                                                maxLength={20}
                                                disabled={cargando}
                                                required
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:bg-slate-100"
                                            />

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
                                                    className="text-xs font-semibold text-blue-700 hover:underline"
                                                >
                                                    ¿Olvidaste tu contraseña?
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
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:bg-slate-100"
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
                                            className="flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {cargando
                                                ? 'Validando acceso...'
                                                : 'Ingresar'}
                                        </button>

                                    </form>


                                    {/* Acciones */}
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

                                        <div className="mt-4 text-center">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMostrarPrivacidad(true)
                                                }
                                                className="text-xs font-medium text-slate-500 hover:text-blue-700 hover:underline"
                                            >
                                                Aviso de privacidad
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </main>


                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-4 text-center text-xs text-slate-400">
                        Inventarios VAAI
                    </div>
                </footer>

            </div>


            {/* Modal privacidad */}
            {mostrarPrivacidad && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

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
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Cerrar"
                            >
                                <span className="text-xl">
                                    ×
                                </span>
                            </button>

                        </div>


                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

                            <p className="text-sm leading-7 text-slate-600">
                                La información proporcionada para ingresar al
                                Sistema de Inventarios VAAI será utilizada para
                                identificar y autenticar a las personas usuarias
                                autorizadas y para registrar las operaciones
                                realizadas dentro de la plataforma.
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
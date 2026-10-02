import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

/*
|--------------------------------------------------------------------------
| Axios + Laravel Sanctum
|--------------------------------------------------------------------------
*/

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

    /*
    |--------------------------------------------------------------------------
    | Iniciar sesión
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMensaje('');
        setCargando(true);

        try {
            /*
            |--------------------------------------------------------------------------
            | Obtener cookie CSRF
            |--------------------------------------------------------------------------
            */

            await axios.get('/sanctum/csrf-cookie');

            /*
            |--------------------------------------------------------------------------
            | Enviar credenciales
            |--------------------------------------------------------------------------
            */

            const response = await axios.post('/api/login', {
                codigo,
                password,
            });

            /*
            |--------------------------------------------------------------------------
            | Login correcto
            |--------------------------------------------------------------------------
            */

            if (response.data?.success) {
                navigate('/dashboard', {
                    replace: true,
                });
            }

        } catch (error) {
            console.error('Error al iniciar sesión:', error);

            /*
            |--------------------------------------------------------------------------
            | Errores de validación
            |--------------------------------------------------------------------------
            */

            if (error.response?.data?.errors) {
                const errores = error.response.data.errors;
                const primerError = Object.values(errores)[0];

                if (Array.isArray(primerError)) {
                    setMensaje(primerError[0]);
                } else {
                    setMensaje('No fue posible iniciar sesión.');
                }

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Error enviado por Laravel
            |--------------------------------------------------------------------------
            */

            if (error.response?.data?.message) {
                setMensaje(error.response.data.message);
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Error de conexión
            |--------------------------------------------------------------------------
            */

            setMensaje(
                'No fue posible conectar con el servidor. Intenta nuevamente.'
            );

        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">

            {/*
            |--------------------------------------------------------------------------
            | Fondo decorativo
            |--------------------------------------------------------------------------
            */}

            <div className="absolute inset-0">

                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>

                <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl"></div>

                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>

            </div>


            {/*
            |--------------------------------------------------------------------------
            | Contenido
            |--------------------------------------------------------------------------
            */}

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">


                    {/*
                    |--------------------------------------------------------------------------
                    | Panel izquierdo
                    |--------------------------------------------------------------------------
                    */}

                    <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">

                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10"></div>

                        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/10"></div>

                        <div>
                            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-7 w-7"
                                >
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                    <path d="m3.3 7 8.7 5 8.7-5" />
                                    <path d="M12 22V12" />
                                </svg>

                            </div>

                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
                                VAAI
                            </p>

                            <h1 className="max-w-md text-4xl font-bold leading-tight">
                                Sistema de Inventarios
                            </h1>

                            <p className="mt-5 max-w-md leading-7 text-blue-100/80">
                                Plataforma para la administración, control y seguimiento
                                de los bienes y recursos del inventario.
                            </p>
                        </div>


                        <div className="relative z-10">

                            <div className="mb-6 h-px bg-white/10"></div>

                            <p className="text-sm leading-6 text-blue-100/70">
                                Acceso exclusivo para usuarios autorizados.
                            </p>

                        </div>

                    </div>


                    {/*
                    |--------------------------------------------------------------------------
                    | Formulario
                    |--------------------------------------------------------------------------
                    */}

                    <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 lg:px-14">

                        <div className="w-full max-w-md">

                            {/*
                            |--------------------------------------------------------------------------
                            | Encabezado móvil
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mb-8 lg:hidden">

                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">

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

                                <h1 className="text-2xl font-bold text-slate-900">
                                    Inventarios VAAI
                                </h1>

                            </div>


                            <div className="mb-8">

                                <p className="mb-2 text-sm font-semibold text-blue-600">
                                    Bienvenido
                                </p>

                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Iniciar sesión
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Ingresa tu código de trabajador y contraseña para
                                    acceder al sistema.
                                </p>

                            </div>


                            {/*
                            |--------------------------------------------------------------------------
                            | Mensaje de error
                            |--------------------------------------------------------------------------
                            */}

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

                                    <span>{mensaje}</span>

                                </div>
                            )}


                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/*
                                |--------------------------------------------------------------------------
                                | Código
                                |--------------------------------------------------------------------------
                                */}

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
                                                <path d="M20 21a8 8 0 0 0-16 0" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>

                                        </div>

                                        <input
                                            id="codigo"
                                            name="codigo"
                                            type="text"
                                            value={codigo}
                                            onChange={(e) => setCodigo(e.target.value)}
                                            placeholder="Ingresa tu código"
                                            autoComplete="username"
                                            maxLength={20}
                                            required
                                            disabled={cargando}
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        />

                                    </div>

                                </div>


                                {/*
                                |--------------------------------------------------------------------------
                                | Contraseña
                                |--------------------------------------------------------------------------
                                */}

                                <div>

                                    <div className="mb-2 flex items-center justify-between">

                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-semibold text-slate-700"
                                        >
                                            Contraseña
                                        </label>

                                        <Link
                                            to="/recuperar-password"
                                            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
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
                                                    width="18"
                                                    height="11"
                                                    x="3"
                                                    y="11"
                                                    rx="2"
                                                    ry="2"
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
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        />


                                        {/*
                                        |--------------------------------------------------------------------------
                                        | Mostrar / ocultar contraseña
                                        |--------------------------------------------------------------------------
                                        */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMostrarPassword(
                                                    !mostrarPassword
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-blue-600"
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
                                                    <path d="m2 2 20 20" />
                                                    <path d="M6.71 6.71C4.6 8.1 3.1 10 2 12c2.4 4.4 5.73 6.6 10 6.6a10.7 10.7 0 0 0 5.29-1.31" />
                                                    <path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c4.27 0 7.6 2.2 10 7a15.9 15.9 0 0 1-2.1 3.07" />
                                                    <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
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


                                {/*
                                |--------------------------------------------------------------------------
                                | Botón Login
                                |--------------------------------------------------------------------------
                                */}

                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {cargando ? (
                                        <>
                                            <svg
                                                className="h-5 w-5 animate-spin"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />

                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                                                />
                                            </svg>

                                            Iniciando sesión...
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


                            {/*
                            |--------------------------------------------------------------------------
                            | Registro
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-8 text-center">

                                <p className="text-sm text-slate-500">
                                    ¿No tienes una cuenta?{' '}

                                    <Link
                                        to="/registro"
                                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        Registrarse
                                    </Link>
                                </p>

                            </div>


                            {/*
                            |--------------------------------------------------------------------------
                            | Aviso de privacidad
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-8 border-t border-slate-200 pt-6 text-center">

                                <p className="text-xs leading-5 text-slate-400">
                                    Al ingresar al sistema aceptas las condiciones
                                    de uso y el tratamiento de la información.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarPrivacidad(true)
                                    }
                                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    Aviso de privacidad
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/*
            |--------------------------------------------------------------------------
            | Modal Aviso de Privacidad
            |--------------------------------------------------------------------------
            */}

            {mostrarPrivacidad && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <h3 className="text-lg font-bold text-slate-900">
                                    Aviso de privacidad
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Sistema de Inventarios VAAI
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Cerrar aviso de privacidad"
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
                                La información proporcionada para el acceso al
                                Sistema de Inventarios VAAI será utilizada
                                exclusivamente para identificar y autenticar a
                                los usuarios autorizados, así como para la
                                operación y administración del sistema.
                            </p>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                El acceso y uso de la plataforma implica el
                                tratamiento de la información necesaria para
                                registrar las operaciones realizadas dentro del
                                sistema.
                            </p>

                            <div className="mt-5 rounded-xl bg-amber-50 p-4">

                                <p className="text-sm leading-6 text-amber-800">
                                    Este texto es provisional. El aviso de
                                    privacidad definitivo deberá sustituirse
                                    por el documento institucional autorizado
                                    para el Sistema de Inventarios VAAI.
                                </p>

                            </div>

                        </div>


                        <div className="flex justify-end border-t border-slate-200 px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarPrivacidad(false)
                                }
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
import React from 'react';

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TiposEquipo from './pages/TiposEquipo';
import Marcas from './pages/catalogos/Marcas';
import Modelos from './pages/catalogos/Modelos';
import AltaEquipo from './pages/equipos/AltaEquipo';
import Equipos from './pages/equipos/Equipos';
import Bajas from './pages/equipos/Bajas';
import Traslados from './pages/equipos/Traslados';
import Dependencias from './pages/dependencias/Dependencias';
import Usuarios from './pages/usuarios/Usuarios';
import RegistrarUsuario from './pages/usuarios/RegistrarUsuario';
import Configuracion from './pages/Configuracion';

import Proveedores from './pages/proveedores/Proveedores';
import AltaProveedor from './pages/proveedores/AltaProveedor';

import Cotizaciones from './pages/cotizaciones/Cotizaciones';
import Altacotizacion from './pages/cotizaciones/Altacotizacion';

import ProtectedRoute from './components/ProtectedRoute';
import DefaultLayout from './layouts/DefaultLayout';

function RouterApp() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Ruta inicial */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Aplicación protegida */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DefaultLayout />
                        </ProtectedRoute>
                    }
                >

                    {/* Dashboard */}
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* Catálogo: Tipos de Equipo */}
                    <Route
                        path="/catalogos/tipos-equipo"
                        element={
                            <ProtectedRoute
                                catalogo="tiposEquipo"
                                permiso="listar"
                            >
                                <TiposEquipo />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catálogo: Marcas */}
                    <Route
                        path="/catalogos/marcas"
                        element={
                            <ProtectedRoute
                                catalogo="marcas"
                                permiso="listar"
                            >
                                <Marcas />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catálogo: Modelos */}
                    <Route
                        path="/catalogos/modelos"
                        element={
                            <ProtectedRoute
                                catalogo="modelos"
                                permiso="listar"
                            >
                                <Modelos />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dependencias"
                        element={
                            <ProtectedRoute
                                catalogo="dependencias"
                                permiso="listar"
                            >
                                <Dependencias />
                            </ProtectedRoute>
                        }
                    />

                    {/* Proveedores registrados */}
                    <Route
                        path="/proveedores"
                        element={
                            <ProtectedRoute
                                catalogo="proveedores"
                                permiso="listar"
                            >
                                <Proveedores />
                            </ProtectedRoute>
                        }
                    />

                    {/* Alta de proveedor */}
                    <Route
                        path="/proveedores/alta"
                        element={
                            <ProtectedRoute
                                catalogo="proveedores"
                                permiso="crear"
                            >
                                <AltaProveedor />
                            </ProtectedRoute>
                        }
                    />

                    {/* Cotizaciones */}
                    <Route
                        path="/cotizaciones"
                        element={
                            <ProtectedRoute
                                catalogo="cotizaciones"
                                permiso="listar"
                            >
                                <Cotizaciones />
                            </ProtectedRoute>
                        }
                    />

                    {/* Registrar cotización */}
                    <Route
                        path="/cotizaciones/alta"
                        element={
                            <ProtectedRoute
                                catalogo="cotizaciones"
                                permiso="crear"
                            >
                                <Altacotizacion />
                            </ProtectedRoute>
                        }
                    />

                    {/* Usuarios registrados */}
                    <Route
                        path="/usuarios"
                        element={
                            <ProtectedRoute
                                catalogo="usuarios"
                                permiso="listar"
                            >
                                <Usuarios />
                            </ProtectedRoute>
                        }
                    />

                    {/* Registro de usuarios */}
                    <Route
                        path="/usuarios/registrar"
                        element={
                            <ProtectedRoute
                                catalogo="usuarios"
                                permiso="crear"
                            >
                                <RegistrarUsuario />
                            </ProtectedRoute>
                        }
                    />

                    {/* Alta de equipo */}
                    <Route
                        path="/equipos/alta"
                        element={
                            <ProtectedRoute
                                catalogo="equipos"
                                permiso="listar"
                            >
                                <AltaEquipo />
                            </ProtectedRoute>
                        }
                    />

                    {/* Equipos registrados */}
                    <Route
                        path="/equipos"
                        element={
                            <ProtectedRoute
                                catalogo="equipos"
                                permiso="listar"
                            >
                                <Equipos />
                            </ProtectedRoute>
                        }
                    />

                    {/* Bajas de equipos */}
                    <Route
                        path="/equipos/bajas"
                        element={
                            <ProtectedRoute
                                catalogo="equipos"
                                permiso="eliminar"
                            >
                                <Bajas />
                            </ProtectedRoute>
                        }
                    />

                    {/* Traslados de equipos */}
                    <Route
                        path="/equipos/traslados"
                        element={
                            <ProtectedRoute
                                catalogo="equipos"
                                permiso="listar"
                            >
                                <Traslados />
                            </ProtectedRoute>
                        }
                    />

                    {/* Configuración del sistema */}
                    <Route
                        path="/configuracion"
                        element={<Configuracion />}
                    />

                </Route>

                {/* Ruta inexistente */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default RouterApp;
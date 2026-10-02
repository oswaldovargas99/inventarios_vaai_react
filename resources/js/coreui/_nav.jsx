import React from 'react';
import CIcon from '@coreui/icons-react';
import {
    cilSpeedometer,
    cilList,
    cilSettings,
} from '@coreui/icons';
import {
    CNavGroup,
    CNavItem,
    CNavTitle,
} from '@coreui/react';

const navigation = [
    {
        component: CNavItem,
        name: 'Dashboard',
        to: '/dashboard',
        icon: (
            <CIcon
                icon={cilSpeedometer}
                customClassName="nav-icon"
            />
        ),
    },
    {
        component: CNavTitle,
        name: 'Inventarios',
    },
    {
        component: CNavGroup,
        name: 'Catálogos',
        icon: (
            <CIcon
                icon={cilList}
                customClassName="nav-icon"
            />
        ),
        items: [
            {
                component: CNavItem,
                name: 'Tipos de Equipo',
                to: '/catalogos/tipos-equipo',
                catalogo: 'tiposEquipo',
                permiso: 'listar',
            },
            {
                component: CNavItem,
                name: 'Marcas',
                to: '/catalogos/marcas',
                catalogo: 'marcas',
                permiso: 'listar',
            },
            {
                component: CNavItem,
                name: 'Modelos',
                to: '/catalogos/modelos',
                catalogo: 'modelos',
                permiso: 'listar',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Equipos',
        icon: (
            <CIcon
                icon={cilList}
                customClassName="nav-icon"
            />
        ),
        items: [
            {
                component: CNavItem,
                name: 'Equipos',
                to: '/equipos',
                catalogo: 'equipos',
                permiso: 'listar',
            },
            {
                component: CNavItem,
                name: 'Alta de equipo',
                to: '/equipos/alta',
                catalogo: 'equipos',
                permiso: 'listar',
            },
            {
                component: CNavItem,
                name: 'Bajas',
                to: '/equipos/bajas',
                catalogo: 'equipos',
                permiso: 'eliminar',
            },
            {
                component: CNavItem,
                name: 'Traslados',
                to: '/equipos/traslados',
                catalogo: 'equipos',
                permiso: 'listar',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Proveedores',
        icon: (
            <CIcon
                icon={cilList}
                customClassName="nav-icon"
            />
        ),
        items: [
            {
                component: CNavItem,
                name: 'Proveedores',
                to: '/proveedores',
                catalogo: 'proveedores',
                permiso: 'listar',
            },
            {
                component: CNavItem,
                name: 'Alta proveedor',
                to: '/proveedores/alta',
                catalogo: 'proveedores',
                permiso: 'crear',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Cotizaciones',
        icon: (
            <CIcon
                icon={cilList}
                customClassName="nav-icon"
            />
        ),
        items: [
            {
                component: CNavItem,
                name: 'Cotizaciones',
                to: '/cotizaciones',
                catalogo: 'cotizaciones',
                permiso: 'listar',
            },
            {
                component: CNavItem,
                name: 'Registrar cotización',
                to: '/cotizaciones/alta',
                catalogo: 'cotizaciones',
                permiso: 'crear',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Dependencias',
        icon: (
            <CIcon
                icon={cilList}
                customClassName="nav-icon"
            />
        ),
        items: [
            {
                component: CNavItem,
                name: 'Registrar dependencia',
                to: '/dependencias',
                catalogo: 'dependencias',
                permiso: 'listar',
            },
        ],
    },
    {
        component: CNavGroup,
        name: 'Usuarios',
        icon: (
            <CIcon
                icon={cilList}
                customClassName="nav-icon"
            />
        ),
        items: [
            {
                component: CNavItem,
                name: 'Usuarios',
                to: '/usuarios',
                catalogo: 'usuarios',
                permiso: 'listar',
            },
            {
                component: CNavItem,
                name: 'Registrar usuario',
                to: '/usuarios/registrar',
                catalogo: 'usuarios',
                permiso: 'crear',
            },
        ],
    },
    {
        component: CNavTitle,
        name: 'Sistema',
    },
    {
        component: CNavItem,
        name: 'Configuración',
        to: '/configuracion',
        icon: (
            <CIcon
                icon={cilSettings}
                customClassName="nav-icon"
            />
        ),
    },
];

export default navigation;
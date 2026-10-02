import './bootstrap';

import React from 'react';
import ReactDOM from 'react-dom/client';

/*
|--------------------------------------------------------------------------
| SimpleBar
|--------------------------------------------------------------------------
|
| Estilos para las barras de desplazamiento utilizadas por CoreUI.
|
*/

import 'simplebar-react/dist/simplebar.min.css';


/*
|--------------------------------------------------------------------------
| Estilos principales
|--------------------------------------------------------------------------
|
| CoreUI se carga desde resources/scss/style.scss mediante @use,
| por lo tanto NO se importa coreui.min.css aquí.
|
*/

import '../scss/style.scss';


/*
|--------------------------------------------------------------------------
| Aplicación React
|--------------------------------------------------------------------------
*/

import RouterApp from './RouterApp';
import { AuthProvider } from './contexts/AuthContext';


/*
|--------------------------------------------------------------------------
| Montaje de React
|--------------------------------------------------------------------------
*/

const root = document.getElementById('app');

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <AuthProvider>
                <RouterApp />
            </AuthProvider>
        </React.StrictMode>
    );
}

import React, { useMemo } from 'react';

import {
    CCloseButton,
    CNavTitle,
    CSidebar,
    CSidebarBrand,
    CSidebarHeader,
} from '@coreui/react';

import { AppSidebarNav } from './AppSidebarNav';

import navigation from '../coreui/_nav';
import useAuth from '../hooks/useAuth';
import { tienePermiso } from '../auth/permisos';

function filtrarNavegacion(items, usuario) {
    const visibles = items.flatMap(({ catalogo, permiso, items: hijos, ...item }) => {
        if ((catalogo !== undefined || permiso !== undefined)
            && !tienePermiso(usuario, catalogo, permiso)) {
            return [];
        }

        if (hijos) {
            const hijosVisibles = filtrarNavegacion(hijos, usuario);
            return hijosVisibles.length > 0 ? [{ ...item, items: hijosVisibles }] : [];
        }

        // Los metadatos internos no llegan a AppSidebarNav ni al DOM.
        return [item];
    });

    // Un título solo se conserva si su sección contiene opciones visibles.
    return visibles.filter((item, index) => (
        item.component !== CNavTitle
        || (index + 1 < visibles.length && visibles[index + 1].component !== CNavTitle)
    ));
}

const AppSidebar = ({ visible, onVisibleChange }) => {
    const { usuario, cargandoInicial } = useAuth();
    const navigationVisible = useMemo(() => (
        filtrarNavegacion(navigation, cargandoInicial ? null : usuario)
    ), [usuario, cargandoInicial]);

    return (
        <CSidebar
            className="border-end"
            colorScheme="dark"
            position="fixed"
            visible={visible}
            onVisibleChange={onVisibleChange}
        >
            <CSidebarHeader className="border-bottom">

                <CSidebarBrand className="fw-semibold text-white">
                    Inventarios VAAI
                </CSidebarBrand>

                <CCloseButton
                    className="d-lg-none"
                    dark
                    onClick={() => onVisibleChange(false)}
                />

            </CSidebarHeader>

            <AppSidebarNav items={navigationVisible} />

        </CSidebar>
    );
};

export default React.memo(AppSidebar);

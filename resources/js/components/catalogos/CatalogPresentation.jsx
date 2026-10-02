import React from 'react';
import { CBadge, CCardHeader, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass } from '@coreui/icons';
import '../../../css/catalogos.css';

export function CatalogHeader({ title, description, children }) {
    return (
        <CCardHeader className="catalog-heading">
            <div>
                <h2 className="catalog-title">{title}</h2>
                <p className="catalog-subtitle">{description}</p>
            </div>
            {children && <div className="catalog-primary-action">{children}</div>}
        </CCardHeader>
    );
}

export function StatusBadge({ active, label }) {
    const texto = label ?? (active ? 'Activo' : 'Inactivo');
    const className = texto === 'Pendiente' ? 'is-pending' : active ? 'is-active' : 'is-inactive';

    return (
        <CBadge className={`catalog-status-badge ${className}`}>
            <span className="catalog-status-mark" aria-hidden="true" />
            {texto}
        </CBadge>
    );
}

export function EquipmentStatusBadge({ status }) {
    const estados = {
        activo: ['Activo', 'is-active'],
        no_activo: ['No activo', 'is-no-active'],
        para_baja: ['Para baja', 'is-for-retirement'],
    };
    const [label, className] = estados[status] ?? ['Sin estatus', 'is-inactive'];

    return (
        <CBadge className={`catalog-status-badge ${className}`}>
            <span className="catalog-status-mark" aria-hidden="true" />
            {label}
        </CBadge>
    );
}

export function CatalogLoading() {
    return (
        <div className="catalog-feedback" role="status" aria-live="polite">
            <CSpinner size="sm" />
            <span className="fw-semibold">Cargando registros…</span>
            <span className="text-body-secondary small">Espera un momento, por favor.</span>
        </div>
    );
}

export function CatalogEmptyState({ filtered, children }) {
    return (
        <div className="catalog-feedback" role="status">
            <span className="catalog-empty-icon"><CIcon icon={cilMagnifyingGlass} size="xl" /></span>
            <span className="fw-semibold">{filtered ? 'No se encontraron resultados para la búsqueda.' : 'No se encontraron registros.'}</span>
            <span className="text-body-secondary small">{filtered ? 'Revisa el texto o los filtros seleccionados.' : 'Los registros aparecerán aquí cuando estén disponibles.'}</span>
            {children}
        </div>
    );
}

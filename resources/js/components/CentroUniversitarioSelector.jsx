import React, { useEffect, useRef, useState } from 'react';
import { CFormInput, CFormLabel, CSpinner } from '@coreui/react';
import {
    etiquetaCentroUniversitario,
    listarCentrosUniversitarios,
} from '../services/centrosUniversitarios';

function CentroUniversitarioSelector({
    id = 'centro-universitario',
    label = 'Centro universitario',
    value = '',
    onChange,
    onSelect,
    seleccionado = false,
    invalid = false,
    error,
    disabled = false,
    required = false,
    placeholder = 'Escribe nombre o abreviatura (ej. CUCEI)',
    helperText,
    className = '',
}) {
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [cargando, setCargando] = useState(false);
    const busquedaRef = useRef(0);

    useEffect(() => {
        if (!mostrarSugerencias) {
            setSugerencias([]);
            setCargando(false);
            return undefined;
        }

        const controlador = new AbortController();
        const solicitud = ++busquedaRef.current;
        const temporizador = window.setTimeout(async () => {
            setCargando(true);
            try {
                const respuesta = await listarCentrosUniversitarios(
                    { buscar: value.trim() },
                    controlador.signal,
                );
                if (solicitud !== busquedaRef.current) return;
                setSugerencias(respuesta.data ?? []);
            } catch (errorBusqueda) {
                if (errorBusqueda.name === 'CanceledError' || errorBusqueda.code === 'ERR_CANCELED') return;
                if (solicitud !== busquedaRef.current) return;
                setSugerencias([]);
            } finally {
                if (solicitud === busquedaRef.current) setCargando(false);
            }
        }, 250);

        return () => {
            window.clearTimeout(temporizador);
            controlador.abort();
        };
    }, [value, mostrarSugerencias]);

    const seleccionar = (centro) => {
        onSelect?.(centro);
        setMostrarSugerencias(false);
        setSugerencias([]);
    };

    return (
        <div className={className}>
            {label && (
                <CFormLabel htmlFor={id}>
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </CFormLabel>
            )}
            <CFormInput
                id={id}
                type="search"
                value={value}
                onChange={(event) => {
                    onChange?.(event.target.value);
                    setMostrarSugerencias(true);
                }}
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={() => window.setTimeout(() => setMostrarSugerencias(false), 150)}
                placeholder={placeholder}
                autoComplete="off"
                invalid={invalid}
                disabled={disabled}
                required={required}
                aria-autocomplete="list"
                aria-expanded={mostrarSugerencias}
            />
            {cargando && (
                <div className="form-text d-flex align-items-center gap-2">
                    <CSpinner size="sm" />
                    Buscando centros...
                </div>
            )}
            {mostrarSugerencias && !cargando && sugerencias.length > 0 && (
                <div className="list-group mt-1" role="listbox" aria-label="Sugerencias de centros universitarios">
                    {sugerencias.map((centro) => (
                        <button
                            key={centro.id}
                            type="button"
                            className="list-group-item list-group-item-action text-start"
                            onMouseDown={() => seleccionar(centro)}
                        >
                            <strong>{centro.abreviatura || '—'}</strong>
                            <span className="text-body-secondary"> — {centro.nombre}</span>
                        </button>
                    ))}
                </div>
            )}
            {mostrarSugerencias && !cargando && value.trim() && sugerencias.length === 0 && (
                <div className="form-text">No hay centros que coincidan con la búsqueda.</div>
            )}
            {seleccionado && !helperText && (
                <div className="form-text">Centro seleccionado correctamente.</div>
            )}
            {helperText && <div className="form-text">{helperText}</div>}
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
}

export { etiquetaCentroUniversitario };
export default CentroUniversitarioSelector;

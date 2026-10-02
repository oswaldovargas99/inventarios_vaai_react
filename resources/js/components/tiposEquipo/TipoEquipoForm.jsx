import { useEffect, useState } from 'react';

function TipoEquipoForm({
    tipoSeleccionado,
    onGuardar,
    onCancelar,
    cargando,
}) {
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        estatus: true,
    });

    useEffect(() => {
        if (tipoSeleccionado) {
            setForm({
                nombre: tipoSeleccionado.nombre ?? '',
                descripcion: tipoSeleccionado.descripcion ?? '',
                estatus: Boolean(tipoSeleccionado.estatus),
            });
        } else {
            setForm({
                nombre: '',
                descripcion: '',
                estatus: true,
            });
        }
    }, [tipoSeleccionado]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onGuardar({
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim() || null,
            estatus: form.estatus,
        });
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="mb-5 text-xl font-semibold text-gray-800">
                {tipoSeleccionado
                    ? 'Editar tipo de equipo'
                    : 'Nuevo tipo de equipo'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="nombre"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Nombre
                    </label>

                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Ej. Laptop"
                    />
                </div>

                <div>
                    <label
                        htmlFor="descripcion"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Descripción
                    </label>

                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        maxLength={255}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Descripción del tipo de equipo"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="estatus"
                        name="estatus"
                        type="checkbox"
                        checked={form.estatus}
                        onChange={handleChange}
                        className="h-4 w-4"
                    />

                    <label
                        htmlFor="estatus"
                        className="text-sm font-medium text-gray-700"
                    >
                        Activo
                    </label>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={cargando}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cargando
                            ? 'Guardando...'
                            : tipoSeleccionado
                              ? 'Actualizar'
                              : 'Guardar'}
                    </button>

                    {tipoSeleccionado && (
                        <button
                            type="button"
                            onClick={onCancelar}
                            disabled={cargando}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default TipoEquipoForm;
function TipoEquipoTable({
    tiposEquipo,
    onEditar,
    onCambiarEstatus,
    onEliminar,
}) {
    if (tiposEquipo.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                    No hay tipos de equipo registrados.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                ID
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Nombre
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Descripción
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Estatus
                            </th>

                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {tiposEquipo.map((tipo) => (
                            <tr key={tipo.id} className="hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm text-gray-600">
                                    {tipo.id}
                                </td>

                                <td className="px-5 py-4 text-sm font-medium text-gray-800">
                                    {tipo.nombre}
                                </td>

                                <td className="px-5 py-4 text-sm text-gray-600">
                                    {tipo.descripcion || 'Sin descripción'}
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                            tipo.estatus
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {tipo.estatus
                                            ? 'Activo'
                                            : 'Inactivo'}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEditar(tipo)}
                                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onCambiarEstatus(tipo)
                                            }
                                            className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
                                        >
                                            {tipo.estatus
                                                ? 'Desactivar'
                                                : 'Activar'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onEliminar(tipo)}
                                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TipoEquipoTable;
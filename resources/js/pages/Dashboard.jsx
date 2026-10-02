import React from 'react';

import {
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CRow,
} from '@coreui/react';

import {
    CChartLine,
} from '@coreui/react-chartjs';

function Dashboard() {
    const metricas = [
        {
            titulo: 'Equipos',
            valor: 125,
            porcentaje: '+8.4%',
            datos: [18, 22, 20, 28, 31, 36, 40],
        },
        {
            titulo: 'Usuarios',
            valor: 18,
            porcentaje: '+2.1%',
            datos: [10, 11, 13, 12, 15, 16, 18],
        },
        {
            titulo: 'Movimientos',
            valor: 37,
            porcentaje: '+12.5%',
            datos: [9, 15, 12, 20, 18, 29, 37],
        },
        {
            titulo: 'Catálogos',
            valor: 10,
            porcentaje: '0%',
            datos: [10, 10, 10, 10, 10, 10, 10],
        },
    ];

    return (
        <CContainer fluid>

            {/* Encabezado */}
            <div className="mb-4">
                <h2 className="page-title mb-1">
                    Dashboard
                </h2>

                <p className="page-subtitle mb-0">
                    Resumen general del Sistema de Inventarios VAAI.
                </p>
            </div>


            {/* Métricas */}
            <CRow className="g-4">

                {metricas.map((metrica, index) => (
                    <CCol
                        key={index}
                        sm={6}
                        xl={3}
                    >

                        <CCard className="h-100 overflow-hidden">

                            <CCardBody className="pb-0">

                                <div className="d-flex align-items-start justify-content-between">

                                    <div>

                                        <div className="text-body-secondary small">
                                            {metrica.titulo}
                                        </div>

                                        <div className="mt-1 d-flex align-items-center gap-2">

                                            <span className="fs-3 fw-semibold">
                                                {metrica.valor}
                                            </span>

                                            <span className="small text-success">
                                                {metrica.porcentaje}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </CCardBody>


                            {/* Gráfica */}
                            <div style={{ height: '90px' }}>

                                <CChartLine
                                    style={{
                                        height: '90px',
                                    }}
                                    data={{
                                        labels: [
                                            'Lun',
                                            'Mar',
                                            'Mié',
                                            'Jue',
                                            'Vie',
                                            'Sáb',
                                            'Dom',
                                        ],

                                        datasets: [
                                            {
                                                label: metrica.titulo,
                                                data: metrica.datos,
                                                fill: true,
                                                tension: 0.4,
                                                pointRadius: 0,
                                                borderWidth: 2,
                                            },
                                        ],
                                    }}
                                    options={{
                                        maintainAspectRatio: false,

                                        plugins: {
                                            legend: {
                                                display: false,
                                            },

                                            tooltip: {
                                                enabled: true,
                                            },
                                        },

                                        scales: {
                                            x: {
                                                display: false,
                                            },

                                            y: {
                                                display: false,
                                            },
                                        },

                                        elements: {
                                            line: {
                                                borderWidth: 2,
                                            },
                                        },

                                        interaction: {
                                            intersect: false,
                                            mode: 'index',
                                        },
                                    }}
                                />

                            </div>

                        </CCard>

                    </CCol>
                ))}

            </CRow>

        </CContainer>
    );
}

export default Dashboard;
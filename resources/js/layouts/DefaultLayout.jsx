import React, { useState } from 'react';

import AppSidebar from '../components/AppSidebar';
import AppHeader from '../components/AppHeader';
import AppContent from '../components/AppContent';
import AppFooter from '../components/AppFooter';

const DefaultLayout = () => {
    const [sidebarVisible, setSidebarVisible] = useState(true);

    return (
        <div>

            {/* Sidebar */}
            <AppSidebar
                visible={sidebarVisible}
                onVisibleChange={setSidebarVisible}
            />


            {/* Contenido principal */}
            <div className="wrapper d-flex flex-column min-vh-100">

                {/* Header */}
                <AppHeader
                    onMenuClick={() => setSidebarVisible((visible) => !visible)}
                />


                {/* Página actual */}
                <div className="body flex-grow-1">
                    <AppContent />
                </div>


                {/* Footer */}
                <AppFooter />

            </div>

        </div>
    );
};

export default DefaultLayout;
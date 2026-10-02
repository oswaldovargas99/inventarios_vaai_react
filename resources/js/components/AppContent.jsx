import React from 'react';

import { Outlet } from 'react-router-dom';

import {
    CContainer,
} from '@coreui/react';

const AppContent = () => {
    return (
        <CContainer
            className="px-4"
            fluid
        >
            <Outlet />
        </CContainer>
    );
};

export default React.memo(AppContent);
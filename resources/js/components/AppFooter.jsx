import React from 'react';

import {
    CFooter,
} from '@coreui/react';

const AppFooter = () => {
    const year = new Date().getFullYear();

    return (
        <CFooter className="px-4">

            <div>
                <span>
                    Inventarios VAAI
                </span>

                <span className="ms-1">
                    © {year}
                </span>
            </div>

            <div className="ms-auto">

                <span className="text-body-secondary">
                    Sistema de Inventarios
                </span>

            </div>

        </CFooter>
    );
};

export default React.memo(AppFooter);
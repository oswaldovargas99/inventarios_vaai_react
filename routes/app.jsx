import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Inventarios VAAI</h1>
            <p>Laravel 12 + React funcionando correctamente.</p>
        </div>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
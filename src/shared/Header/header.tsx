// Menubar.tsx
import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { logout } from '../../components/authentication/SessionManager';

const Header: React.FC = () => {
    const items = [
        {
            label: 'Inicio',
            icon: 'pi pi-fw pi-home',
            url: '/inicio',
            key: "Contacto",
        },
        {
            label: 'Envio de Plantillas',
            icon: 'pi pi-fw pi-file-excel',
            url: `${import.meta.env.VITE_PUBLIC_URL}/inicio/recepcion`,
            key: "Conversion_Excel"
        },
        {
            label: 'Consulta de Lotes',
            icon: 'pi pi-fw pi-inbox',
            url: `${import.meta.env.VITE_PUBLIC_URL}/inicio/consulta`,
            key: "Consulta_Lotes"
        },
    ];

    return (
        <div className="header-container">
            <div className="header-content">
                <div className="menubar-container">
                    <Menubar model={items} />
                </div>
                <div className="logout-button-container">
                    <Button
                        type="button"
                        icon="pi pi-power-off"
                        className="p-button-outlined p-button-warning button-shadow"
                        raised
                        style={{ borderRadius: '50%', border: 'none' }}
                        onClick={logout}
                    />
                </div>
            </div>
        </div>
    );
}

export default Header;

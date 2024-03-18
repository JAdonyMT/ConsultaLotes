import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';
import Header from '../Header/header';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div className="layout-container">
            <Header/>
            <main>
                {/* Aquí se renderizarán los componentes hijos */}
                <div className='main-container container-fluid'>
                    <Outlet />
                </div>
                {location.pathname === '/inicio' && (
                    <div className="boxInicio">
                        <p className="titleInicio">Servicio de Lotes!</p>
                    </div>
                )}
            </main>
            <footer>
                <p>Derechos de autor © 2024 - FACTURED S.A. DE C.V.</p>
            </footer>
        </div>
    );
}

export default Layout;
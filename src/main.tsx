// main.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Loader from './shared/Loaders/Loaders';
import Layout from './shared/Layout/layout';
import AuthLogin from './components/authentication/Login';
import { checkSession } from './components/authentication/SessionManager';
import './index.css'
import './index.scss'


const Consulta = React.lazy(() => import('./components/Lotes/app'));
const Recepcion = React.lazy(() => import('./components/Recepcion/app'));


const App = () => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const isAuthenticated = await checkSession();
      setIsUserAuthenticated(isAuthenticated);

      // Si el usuario no está autenticado, redirige a la vista de inicio de sesión
      if (!isAuthenticated) {
        navigate(`${import.meta.env.VITE_PUBLIC_URL}/`);
      }

      // Si el usuario está autenticado y trata de acceder a la página de inicio de sesión, redirige a la vista de inicio
      if (
        isAuthenticated &&
        window.location.pathname === `${import.meta.env.VITE_PUBLIC_URL}/`
      ) {
        navigate(`${import.meta.env.VITE_PUBLIC_URL}/inicio`);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    verifySession();
  }, [navigate]);

  if (isUserAuthenticated === null) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <React.Suspense fallback={<Loader/>}>
        <Routes>
          {isUserAuthenticated ? (
            <Route
              path={`${import.meta.env.VITE_PUBLIC_URL}/inicio`}
              element={<Layout />}
            >
              <Route path="recepcion" element={<Recepcion />} />
              <Route path="consulta" element={<Consulta />} />
            </Route>
          ) : (
            <Route
              path={`${import.meta.env.VITE_PUBLIC_URL}/`}
              element={<AuthLogin />}
            />
          )}
        </Routes>
      </React.Suspense>
    </React.Fragment>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
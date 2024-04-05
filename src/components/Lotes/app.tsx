import React, { useState, useEffect } from 'react';
import Card from './components/Cards';

interface LotesData {
    [fileName: string]: string;
}


const App: React.FC = () => {
    const [lotes, setLotes] = useState<LotesData>({});
    const [isLoading, setIsLoading] = useState(true);

    const token = sessionStorage.getItem('AuthToken');

    const header = new Headers();

    if (token) {
        header.append('Authorization', token);
    }

    const fetchData = async () => {
        try {
            const responseLotes = await fetch(`${import.meta.env.VITE_API_LOCALHOST}/status/lotes`, { headers: header });
            if (responseLotes.ok) {
                const jsonData = await responseLotes.json();
                setLotes(jsonData.historial_lotes);
            } else {
                console.error('Error al obtener los datos de los lotes del servidor');
            }
        } catch (error) {
            console.error('Error de red al obtener los datos de los lotes:', error);
        } finally {
            setIsLoading(false); // Indica que la carga ha terminado, independientemente del resultado
        }
    };

    useEffect(() => {
        fetchData();

        const interval = setInterval(() => {
            fetchData();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='text-center mt-5'>
            <h1>CONSULTA DE LOTES</h1>
            {Object.keys(lotes).length === 0 ? (
                <div className='non-content'>
                    {isLoading ? (
                        <div className="spinner-border text-primary mt-5" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        <h3>No hay status de lotes disponibles.</h3>
                    )}
                </div>
            ) : (
                <div className='content-list'>
                    <div style={{ maxWidth: '900px', width: '100%' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            {Object.keys(lotes).map((fileName, index) => (
                                <div key={index} style={{ width: 'calc(50% - 10px)' }}>
                                    <Card fileName={fileName} status={lotes[fileName]} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
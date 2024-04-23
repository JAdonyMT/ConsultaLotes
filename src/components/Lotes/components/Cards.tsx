import React, { useEffect, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact
import 'primeicons/primeicons.css';
import List from './List';

interface CardProps {
    fileName: string;
    status: string;
}

const Card: React.FC<CardProps> = ({ fileName, status }) => {
    const [visible, setVisible] = useState(false);
    const [historialIddtes, setHistorialIddtes] = useState<{ [iddte: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [processActive, setProcessActive] = useState(false);

    const getLoteNumber = (fileName: string): string => {
        // Extraer el número de lote del nombre del archivo
        const matches = fileName.match(/Lote_(\d+)\.xlsx/);
        return matches ? matches[1] : '';
    };

    const token = sessionStorage.getItem('AuthToken');

    const showDialog = async () => {
        try {
            const header = new Headers();
            if (token) {
                header.append('Authorization', token);
            }
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_BACKEND}/status/iddte/${getLoteNumber(fileName)}`, { headers: header });
            
            if (response.ok) {
                const data = await response.json();
                setHistorialIddtes(data);
            } else {
                console.error('Error al obtener los detalles del lote del servidor');
            }
        } catch (error) {
            console.error('Error de red al obtener los detalles del lote:', error);
        } finally {
            setIsLoading(false); // Establece isLoading en false, ya sea que la solicitud sea exitosa o no
            setVisible(true); // Solo establece la visibilidad en true si la carga de datos ha terminado correctamente
        }
    };


    const hideDialog = () => {
        setVisible(false); // Marcar que el diálogo está cerrado
    };

    const isUploadDte = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BACKEND}/process/status`);
            if (response.ok) {
                const data = await response.json();
                setProcessActive(data.running)
                console.log(data); // Muestra la respuesta en la consola
            } else {
                console.error('Error al obtener los detalles del proceso de envio');
            }
        } catch (error) {
            console.error('Error de red al obtener los detalles del envio:', error);
        }
    };

    useEffect(() => {
        if (visible){
            const intervalId = setInterval(isUploadDte, 2000); // Llama a isUploadDte cada 2 segundos
            return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonta
        }
    }, [visible]);

    const renderIcon = () => {
        if (status.trimEnd() === 'Proceso de conversion exitoso') {
            return <i className="pi pi-check" style={{ color: 'green', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        } else if (status.includes('Proceso de conversion')) {
            return <i className="pi pi-exclamation-triangle" style={{ color: 'orange', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        } else {
            return <i className="pi pi-times" style={{ color: 'red', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        }
    };


    return (
        <div>
            {isLoading &&  <div className="spinner-border text-primary mt-5" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div> } 
            {!isLoading && (
                <div className="card">
                    <Accordion multiple>
                        <AccordionTab header={<div style={{ textAlign: 'left' }}>{fileName} {renderIcon()}</div>}>
                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p className="m-0" style={{ maxWidth: 'calc(100% - 40px)' }}><strong>Estado:</strong> {status}</p>
                                    {status.trimEnd().includes('Proceso de conversion') && (
                                        <Button
                                            icon="pi pi-eye"
                                            tooltip='Status IDDTE'
                                            tooltipOptions={{ position: 'top' }}
                                            className="p-button-secondary p-button-rounded p-mr-2"
                                            style={{ borderRadius: '50%' }}
                                            onClick={showDialog}
                                        />
                                    )}
                                </div>
                            </div>
                        </AccordionTab>
                    </Accordion>
                    <Dialog
                        draggable={false}
                        header={`Detalles del ${fileName} - ${processActive ? 'Corriendo' : 'Terminado'}`}
                        visible={visible}
                        style={{ width: '50vw' }}
                        onHide={hideDialog}
                        maximizable={true}
                    >
                        <ul>
                            {Object.entries(historialIddtes).map(([loteName, iddtes]) => {
                                return (
                                    <div key={loteName}>
                                        <ul style={{ padding: '0' }}>
                                            {Object.entries(iddtes).map(([iddte, status]) => (
                                                <li key={iddte}>
                                                    <List id={iddte} status={status} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </ul>
                    </Dialog>
                </div>
            )}
        </div>
    );
    
};

export default Card;
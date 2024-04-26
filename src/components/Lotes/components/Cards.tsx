import React, {  useEffect, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ToggleButton } from 'primereact/togglebutton';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact
import 'primeicons/primeicons.css';
import './lotes.css'
import List from './List';

interface CardProps {
    fileName: string;
    status: string;
}

const Card: React.FC<CardProps> = ({ fileName, status }) => {
    const [visible, setVisible] = useState(false);
    const [historialIddtes, setHistorialIddtes] = useState<{ [iddte: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [exitosoActivo, setExitosoActivo] = useState(false);
    const [errorActivo, setErrorActivo] = useState(false);


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

    // Función para filtrar los datos según los estados de los filtros
    const filterHistorialIddtes = () => {
        // Aplicar los filtros según los estados de los ToggleButtons
        const filteredEntries = Object.entries(historialIddtes).map(([loteName, iddtes]) => {
            const filteredIddtes = Object.fromEntries(
                Object.entries(iddtes).filter(([_iddte, status]) => {
                    if (exitosoActivo) {
                        // Filtrar solo los elementos exitosos basados en CodigoGeneracion y SelloRecibido
                        // Buscar los valores de CodigoGeneracion y SelloRecibido en la cadena de estado
                        const codigoGeneracionMatch = status.match(/"CodigoGeneracion":"([^"]+)"/);
                        const selloRecibidoMatch = status.match(/"SelloRecibido":"([^"]+)"/);

                        // Verificar si se encontraron ambos valores
                        return codigoGeneracionMatch !== null && selloRecibidoMatch !== null;
                    }

                    if (errorActivo) {
                        // Buscar el valor de Estado y SelloRecibido en la cadena de estado
                        const estadoMatch = status.match(/"Estado":"([^"]+)"/);
                        const selloRecibidoMatch = status.match(/"SelloRecibido":"([^"]+)"/);

                        // Verificar si se encontraron ambos valores y cumplen con los criterios de error
                        return estadoMatch !== null && estadoMatch[1] === "RECHAZADO" && (selloRecibidoMatch === null || selloRecibidoMatch[1] === "null");
                    }
                    // Si el filtro de exitoso no está activo, incluir todos los elementos
                    return true;
                })

            );
            return [loteName, filteredIddtes];
        });

        return Object.fromEntries(filteredEntries);
    };

    const filteredHistorialIddtes = filterHistorialIddtes();

    // Función para manejar el cambio en los ToggleButtons
    const handleToggleChange = (e: any) => {
        if (e.target.name === 'exitoso') {
            setExitosoActivo(e.value);
        } else if (e.target.name === 'error') {
            setErrorActivo(e.value);
        }
    };


    const hideDialog = () => {
        setVisible(false); // Marcar que el diálogo está cerrado

        setExitosoActivo(false);
        setErrorActivo(false);
    };

    // useEffect(() => {
    //     let socket: WebSocket;

    //     const handleSocketMessage = async (event: MessageEvent) => {
    //         const message = event.data.trim();
    //         setIsRunning(message);

    //         if (message === "true") {
    //             try {
    //                 const header = new Headers();
    //                 if (token) {
    //                     header.append('Authorization', token);
    //                 }
    //                 const response = await fetch(`${import.meta.env.VITE_API_BACKEND}/status/iddte/${getLoteNumber(fileName)}`, { headers: header });

    //                 if (response.ok) {
    //                     const data = await response.json();
    //                     setHistorialIddtes(data);
    //                 } else {
    //                     console.error('Error al obtener los detalles del lote del servidor');
    //                 }
    //             } catch (error) {
    //                 console.error('Error de red al obtener los detalles del lote:', error);
    //             }
    //         }
    //     };

    //     if (visible) {
    //         socket = new WebSocket(`ws://${import.meta.env.VITE_API_BACKEND_WS}/progress-status`);
    //         socket.onmessage = handleSocketMessage;
    //         socket.onerror = (error) => {
    //             console.error('Error en la conexión WebSocket:', error);
    //         };
    //         socket.onclose = () => {
    //             console.log('Conexión WebSocket cerrada');
    //         };
    //     }

    //     return () => {
    //         if (socket) {
    //             socket.close();
    //         }
    //     };
    // }, [visible]);



    const renderIcon = () => {
        if (status.trimEnd() === 'Proceso de conversion exitoso') {
            return <i className="pi pi-check" style={{ color: 'green', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        } else if (status.includes('Proceso de conversion')) {
            return <i className="pi pi-exclamation-triangle" style={{ color: 'orange', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        } else {
            return <i className="pi pi-times" style={{ color: 'red', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        }
    };

    const header = (
        <div className='d-flex' style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className='d-flex'>
                <div>Detalles del {fileName}</div>
                <div style={{ marginRight: '1rem', marginLeft: '1rem' }}>
                    {isRunning && <div><ProgressSpinner style={{ width: '35px', height: '35px' }} strokeWidth="5" animationDuration='0.75s' />
                    </div>}
                </div>
            </div>
            <div>
                <ToggleButton
                    onLabel="Exitoso"
                    offLabel='Exitoso'
                    onIcon="pi pi-check"
                    offIcon="pi pi-circle"
                    checked={exitosoActivo} onChange={handleToggleChange} name='exitoso'
                    className={exitosoActivo ? 'p-button-success p-button-sm' : 'p-button-sm'}
                    style={{ marginRight: '0.5rem' }}
                    disabled={errorActivo && !exitosoActivo}
                />
                <ToggleButton
                    onLabel="Error"
                    offLabel='Error'
                    onIcon="pi pi-times"
                    offIcon="pi pi-circle"
                    checked={errorActivo}
                    onChange={handleToggleChange}
                    name='error'
                    className={errorActivo ? 'p-button-danger p-button-sm' : 'p-button-sm'}
                    disabled={exitosoActivo && !errorActivo}
                />
            </div>
        </div>
    )


    return (
        <div>
            {isLoading && <div className="spinner-border text-primary mt-5" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>}
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
                        header={header}
                        visible={visible}
                        style={{ width: '50vw' }}
                        onHide={hideDialog}
                        maximizable={true}
                    >
                        <ul>
                            {(Object.entries(filteredHistorialIddtes) as [string, { [iddte: string]: string }][]).map(([loteName, iddtes]) => (
                                <div key={loteName}>
                                    <ul style={{ padding: '0' }}>
                                        {Object.entries(iddtes).map(([iddte, status]) => (
                                            <li key={iddte}>
                                                <List id={iddte} status={status} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </ul>
                    </Dialog>
                </div>
            )}
        </div>
    );

};

export default Card;
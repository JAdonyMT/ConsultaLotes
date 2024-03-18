import React, { useState } from 'react';
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

    const getLoteNumber = (fileName: string): string => {
        // Extraer el número de lote del nombre del archivo
        const matches = fileName.match(/Lote_(\d+)\.xlsx/);
        return matches ? matches[1] : '';
    };

    const showDialog = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_LOCALHOST}/status/iddte/${getLoteNumber(fileName)}`);
            if (response.ok) {
                const data = await response.json();
                setHistorialIddtes(data);
            } else {
                console.error('Error al obtener los detalles del lote del servidor');
            }
        } catch (error) {
            console.error('Error de red al obtener los detalles del lote:', error);
        }
        setVisible(true);
    };

    const hideDialog = () => setVisible(false);


    const renderIcon = () => {
        if (status === 'Proceso de conversion exitoso') {
            return <i className="pi pi-check" style={{ color: 'green', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        } else {
            return <i className="pi pi-times" style={{ color: 'red', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        }
    };

    return (
        <div className="card">
            <Accordion multiple>
                <AccordionTab header={
                        <div style={{ textAlign: 'left' }}>{fileName} {renderIcon()}</div>
                }>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p className="m-0" style={{
                            maxWidth: 'calc(100% - 30px)', // Ancho máximo del texto
                            overflow: 'hidden',
                            textOverflow: 'unset', // Desactiva el truncamiento
                            whiteSpace: 'break-spaces', // Permite que el texto se rompa en varias líneas
                        }}><strong>Estado:</strong> {status}</p>
                        {status === 'Proceso de conversion exitoso' && (
                            <Button
                                icon="pi pi-eye"
                                tooltip='Status IDDTE'
                                tooltipOptions={{ position: 'top' }}
                                className="p-button-secondary p-button-rounded p-mr-2"
                                style={{ borderRadius: '50%' }}
                                onClick={showDialog} />
                        )}
                    </div>
                </AccordionTab>
            </Accordion>
            <Dialog 
                draggable={false} 
                header={`Detalles del ${fileName}`} 
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
    );
};

export default Card;
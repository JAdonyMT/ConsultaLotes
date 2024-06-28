import React, { useRef, useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { Tooltip } from 'primereact/tooltip';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import 'primereact/resources/themes/saga-blue/theme.css'; // Tema de PrimeReact
import 'primereact/resources/primereact.min.css'; // Estilos de PrimeReact
import 'primeicons/primeicons.css';
import './lotes.css'
import List from './List';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

interface CardProps {
    fileName: string;
    status: string;
}

interface IddteEntries {
    [loteName: string]: {
        [iddte: string]: string;
    };
}

const Card: React.FC<CardProps> = ({ fileName, status }) => {
    const [visible, setVisible] = useState(false);
    const [historialIddtes, setHistorialIddtes] = useState<IddteEntries>({});
    const [isLoading, setIsLoading] = useState(false);
    // const [isRunning, setIsRunning] = useState(false);
    const [exitosoActivo, setExitosoActivo] = useState(false)
    const [errorActivo, setErrorActivo] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

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
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al obtener los detalles del lote', life: 3000 });
            console.error('Error de red al obtener los detalles del lote:', error);
        } finally {
            setIsLoading(false); // Establece isLoading en false, ya sea que la solicitud sea exitosa o no
            setVisible(true); // Solo establece la visibilidad en true si la carga de datos ha terminado correctamente
        }
    };

    // Función para filtrar los datos según los estados de los filtros
    const filterHistorialIddtes = (): IddteEntries => {
        // Aplicar los filtros según los estados de los ToggleButtons
        const filteredEntries = Object.entries(historialIddtes).map(([loteName, iddtes]) => {
            const filteredIddtes = Object.fromEntries(
                Object.entries(iddtes).filter(([_iddte, status]) => {
                    if (exitosoActivo) {
                        // Filtrar solo los elementos exitosos basados en CodigoGeneracion y SelloRecibido
                        // Buscar los valores de CodigoGeneracion y SelloRecibido en la cadena de estado
                        const codigoGeneracionMatch = status.match(/"CodigoGeneracion":"([^"]+)"/);
                        const selloRecibidoMatch = status.match(/"SelloRecibido":"([^"]+)"/);
                        const estadoMatch = status.match(/"Estado":"([^"]+)"/);

                        // Verificar si se encontraron ambos valores
                        return codigoGeneracionMatch !== null && selloRecibidoMatch !== null && estadoMatch !== null && (estadoMatch[1] === "ACEPTADO" || estadoMatch[1] === "PROCESADO");
                    }

                    if (errorActivo) {
                        // Buscar el valor de Estado en la cadena de estado
                        const estadoMatch = status.match(/Código: (\d{1,3})/);


                        // Verificar si se encontró el valor del código de estado y si es un código de error
                        if (estadoMatch !== null && (estadoMatch[1] === "0" || estadoMatch[1] === "400" || estadoMatch[1] === "401" || estadoMatch[1] === "404" || estadoMatch[1] === "500")) {
                            return true; // Es un código de error, no se necesita verificar SelloRecibido 
                        } else {
                            // Verificar si el estado es "RECHAZADO" y SelloRecibido es null
                            const estadoMatch = status.match(/"Estado":"([^"]+)"/);
                            const selloRecibidoMatch = status.match(/"SelloRecibido":"([^"]+)"/);
                            return estadoMatch !== null && estadoMatch[1] === "RECHAZADO" && (selloRecibidoMatch === null || selloRecibidoMatch[1] === "null");
                        }
                    }
                    // Si el filtro de exitoso no está activo, incluir todos los elementos
                    return true;
                })

            );
            return [loteName, filteredIddtes];
        });

        return Object.fromEntries(filteredEntries);
    };


    const applyGlobalFilter = (entries: IddteEntries): IddteEntries => {
        if (!globalFilter) return entries;

        const query = globalFilter.toLowerCase();
        const filtered = Object.entries(entries).reduce<IddteEntries>((acc: IddteEntries, [loteName, iddtes]) => {
            const filteredIddtes = Object.entries(iddtes).filter(([iddte]) => {
                // const codGenMatch = status.match(/"CodigoGeneracion":"([^"]+)"/);
                // const codGen = codGenMatch ? codGenMatch[1] : '';
                return iddte.toLowerCase().includes(query);
            });
            if (filteredIddtes.length > 0) {
                acc[loteName] = Object.fromEntries(filteredIddtes);
            }
            return acc;
        }, {});

        return filtered;
    };

    const filteredHistorialIddtes = applyGlobalFilter(filterHistorialIddtes());

    const handleExitosoToggleChange = () => {
        setExitosoActivo(!exitosoActivo);
        if (errorActivo) setErrorActivo(false);
    };

    const handleErrorToggleChange = () => {
        setErrorActivo(!errorActivo);
        if (exitosoActivo) setExitosoActivo(false);
    };


    const hideDialog = () => {
        setVisible(false); // Marcar que el diálogo está cerrado

        setExitosoActivo(false);
        setErrorActivo(false);
        setGlobalFilter('');
    };

    const renderIcon = () => {
        if (status.trimEnd() === 'Proceso de conversion exitoso') {
            return <i className="pi pi-check" style={{ color: 'green', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        } else if (status.includes('Proceso de conversion')) {
            return <i className="pi pi-exclamation-triangle" style={{ color: 'orange', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        } else {
            return <i className="pi pi-times" style={{ color: 'red', fontSize: '1.2em', marginLeft: '0.5em' }} />;
        }
    };

    const filenameSplit = fileName.split(':');

    const countExitosos = () => {
        let count = 0;
        Object.entries(filteredHistorialIddtes).forEach(([_loteName, iddtes]) => {
            Object.values(iddtes).forEach(status => {
                const estadoMatch = status.match(/"Estado":"([^"]+)"/);
                if (estadoMatch && (estadoMatch[1] === "ACEPTADO" || estadoMatch[1] === "PROCESADO")) {
                    count++;
                }
            });
        });
        return count;
    };

    const countErrores = () => {
        let count = 0;
        Object.entries(filteredHistorialIddtes).forEach(([_loteName, iddtes]) => {
            Object.values(iddtes).forEach(status => {
                const estadoMatch = status.match(/Código: (\d{1,3})/);
                if (estadoMatch && ["0", "400", "401", "404", "500"].includes(estadoMatch[1])) {
                    count++;
                } else {
                    const estadoMatch = status.match(/"Estado":"([^"]+)"/);
                    const selloRecibidoMatch = status.match(/"SelloRecibido":"([^"]+)"/);
                    if (estadoMatch && estadoMatch[1] === "RECHAZADO" && (selloRecibidoMatch === null || selloRecibidoMatch[1] === "null")) {
                        count++;
                    }
                }
            });
        });
        return count;
    };


    const header = (
        <div className='d-flex' style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className='d-flex'>
                <div>Detalles del {filenameSplit[0]}</div>
            </div>
            <div>
                <button
                    className={`toggle-button ${exitosoActivo ? 'success' : ''}`}
                    onClick={handleExitosoToggleChange}
                    disabled={errorActivo && !exitosoActivo}
                >
                    <i className={exitosoActivo ? 'pi pi-check' : 'pi pi-circle'}></i>
                    Exitoso
                </button>
                <button
                    className={`toggle-button ${errorActivo ? 'error' : ''}`}
                    onClick={handleErrorToggleChange}
                    disabled={exitosoActivo && !errorActivo}
                >
                    <i className={errorActivo ? 'pi pi-times' : 'pi pi-circle'}></i>
                    Error
                </button>
            </div>
        </div>
    )


    const tagDte: { [key: string]: string } = {
        '01': 'FC',
        '03': 'CCF',
        '04': 'NR',
        '05': 'NC',
        '06': 'ND',
        '07': 'CR',
        '08': 'CL',
        '09': 'DCL',
        '11': 'FEX',
        '14': 'FSE',
        '15': 'CD',
        'cancel': 'cancel'

    }


    const confirmReport = (event: { currentTarget: any; }) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Desea generar un reporte de los DTEs?',
            icon: 'pi pi-download',
            defaultFocus: 'accept',
            className: 'confirm-popup',
            acceptClassName: 'p-button-success m-1',
            rejectClassName: 'p-button-danger m-1',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                getReportExcel();
            },
            reject: () => {
                console.log('Reporte cancelado');
            }
        })
    }


    const getReportExcel = async () => {
        const header = new Headers();
        if (token) {
            header.append('Authorization', token);
        }
        try {

            const response = await fetch(`${import.meta.env.VITE_API_BACKEND}/report/${getLoteNumber(fileName)}`, { headers: header })
            //base64 to excel
            if (response.ok) {
                const responseData = await response.json();
                const base64Excel = responseData.ReporteExcel;
                const byteCharacters = atob(base64Excel);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.setAttribute('download', `reporte-${filenameSplit[0]}`);
                document.body.appendChild(a);
                a.click();
                if (a.parentNode) {
                    a.parentNode.removeChild(a);
                }

            }else{
                toast.current?.show({severity: 'error', summary: 'Error', detail: 'Error al obtener el reporte', life: 3000})
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al obtener el reporte', life: 3000 });
        }
    }

    return (
        <div>
            <Toast ref={toast} />
            <ConfirmPopup />
            {isLoading && <div className="spinner-border text-primary mt-5" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>}
            {!isLoading && (
                <div className="card">
                    <Accordion multiple>
                        <AccordionTab header={<div className='d-flex justify-content-between'>
                            <div style={{ textAlign: 'left' }}>{filenameSplit[0]} {renderIcon()}</div>
                            <div>
                                <Tag className='custom-tag' rounded>
                                    {tagDte[filenameSplit[1]]}
                                </Tag>
                            </div>
                        </div>}>

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
                        <div className='d-flex justify-content-between align-items-center mb-1'>
                            <AutoComplete
                                value={globalFilter}
                                completeMethod={(e) => setGlobalFilter(e.query)}
                                onChange={(e) => setGlobalFilter(e.value)}
                                placeholder="Buscar"
                            />
                            <Tooltip target=".button-report" position="right">
                                <div>
                                    <i className='pi pi-check' style={{ color: '#34FF48' }}></i>
                                    <span>{countExitosos()} </span>
                                    <span>/ </span>
                                    <span>{countErrores()}</span>
                                    <i className='pi pi-times' style={{ color: '#FF3434' }}></i>
                                </div>
                            </Tooltip>
                            <div>
                                <label>
                                    Descargar reporte
                                </label>
                                <Button
                                    onClick={confirmReport}
                                    className='button-report'
                                    icon='pi pi-file-export'
                                    text
                                    raised
                                    style={{ borderRadius: '50%', padding: '0.3em', marginLeft: '0.5rem' }}>
                                </Button>
                            </div>
                        </div>
                        <ul>
                            {Object.keys(filteredHistorialIddtes).length === 0 && (
                                <p className='text-center'>No hay DTEs para mostrar</p>
                            )}
                            {(Object.entries(filteredHistorialIddtes) as [string, { [iddte: string]: string }][]).map(([loteName, iddtes]) => (
                                <div key={loteName}>
                                    <ul style={{ padding: '0' }}>
                                        {Object.entries(iddtes).map(([iddte, status]) => (
                                            <li key={iddte}>
                                                <List id={iddte} status={status} tipoDte={filenameSplit[1]} />
                                            </li>
                                        ))}
                                        {Object.keys(iddtes).length === 0 && (
                                            <p className='text-center'>No hay DTEs para mostrar</p>

                                        )}
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
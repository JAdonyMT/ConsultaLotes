import React from "react";
import "./lotes.css";

interface ListProps {
    id: string;
    status: string;

}

const List: React.FC<ListProps> = ({ id, status }) => {
    const displayProperties = {
        CodigoGeneracion: "Código Generación",
        NumeroIntentos: "Número Intentos",
        Fecha: "Fecha",
        Version: "Versión",
        Estado: "Estado",
        NumeroControl: "Número de Control",
        SelloRecibido: "Sello Recibido",
        FechaProcesamiento: "Fecha de Procesamiento",
        DescripcionMsg: "Descripción del Mensaje",
        ObservacionesCliente: "Observaciones",
    };

    // Parse the JSON string in the status message
    let statusObj: any = {};
    const statusMatch = status.match(/Mensaje: (.*)/);
    if (statusMatch && statusMatch[1]) {
        try {
            statusObj = JSON.parse(statusMatch[1]);
        } catch (error) {
            console.error("Error parsing status message JSON:", error);
        }
    }

    const statusCode = status.match(/Código: (\d+)/);
    let codigo: number = 0;
    if (statusCode && statusCode[1]) {
        codigo = parseInt(statusCode[1]);
    }

    return (
        <div className="status-details">
            <div className="d-flex justify-content-between">
                <h5>{id}</h5>
            </div>
            {codigo == 200 ? (
                <ul>
                    {Object.entries(displayProperties).map(
                        ([key, label]) =>
                            statusObj[key] !== undefined && (
                                <li key={key}>
                                    <strong>{label}:</strong> {statusObj[key] !== null ? statusObj[key] : 'N/A'}
                                </li>
                            )
                    )}
                </ul>
            ) : (
                <p>{status}</p>
            )}
        </div>
    );
};

export default List;

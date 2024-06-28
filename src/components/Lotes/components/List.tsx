import { useRef } from "react";
import "./lotes.css";
import { Toast } from "primereact/toast";
import { Button } from 'primereact/button';
        

interface ListProps {
    id: string;
    status: string;
    tipoDte: string

}

const List: React.FC<ListProps> = ({ id, status, tipoDte }) => {
    const toast = useRef<Toast>(null);

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


    const formatDate = (dateString: string) => {
        return dateString.split('T')[0];
    };

    // Function to download PDF
    const descargarPdf = async () => {
        const codGen = statusObj.CodigoGeneracion;
        const fechaEmi = statusObj.Fecha;
        const dte = tipoDte
        const api = `${import.meta.env.VITE_API_FACTURED}/v1/dte/consult`;
        const token = sessionStorage.getItem('AuthToken');

        const data = {
            "CodigoGeneracion": codGen,
            "FechaEmision": formatDate(fechaEmi),
            "TipoDte": dte,
        }

        try {
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
            }
            const response = await fetch(api, {
                headers,
                method: 'POST',
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const responseData = await response.json();
                const base64Pdf = responseData.pdfDTE;

                // Convert base64 to Blob
                const byteCharacters = atob(base64Pdf);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Create a link and download the PDF
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${codGen}.pdf`);
                document.body.appendChild(link);
                link.click();
                if(link.parentNode){
                    link.parentNode.removeChild(link);
                }
            } else {
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'Error al obtener el PDF' 
                });
                console.error('Error al obtener el PDF: Respuesta no OK');
            }
        } catch (error) {
            console.error('Error al obtener el PDF:', error);
        }
    };

    return (
        <div>

            <Toast ref={toast}></Toast>
            <div className="status-details">
                <div className="d-flex justify-content-between">
                    <h5>{id}</h5>
                    {codigo == 200 && tipoDte !== 'cancel' && (
                        <Button 
                            onClick={descargarPdf} 
                            icon='pi pi-fw pi-file-pdf' 
                            style={{padding: '0', borderRadius: '30%', backgroundColor: '#e96c24', border: 'none'}}
                            tooltip="Descargar PDF"
                            >    
                            </Button>
                    )}
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
        </div>
    );
};

export default List;

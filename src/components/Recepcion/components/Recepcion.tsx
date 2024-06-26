import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import Dropzone from 'react-dropzone';
import { Tag } from 'primereact/tag';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import './recepcion.css';
import icon from '../../../assets/img/logo.svg'
import xlsx from '../../../assets/img/xlsx.png'
//import { config } from '../../../../../config';


function FormEnvio() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [fileTags, setFileTags] = useState<{ [key: string]: string }[]>([]);
    const overlayRefs = useRef<OverlayPanel[]>([]);
    const toast = useRef<Toast>(null);




    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setFileTags((prevTags) => [...prevTags, ...newFiles.map(() => ({ tag: '' }))]);
    };

    const handleTagClick = (index: number, event: React.MouseEvent) => {
        const overlayPanel = overlayRefs.current[index];
        if (overlayPanel) {
            overlayPanel.toggle(event);

            const target = event.currentTarget as HTMLElement;
            const overlay = (overlayPanel as any).panel?.parentElement as HTMLElement;


            if (target && overlay) {
                const targetRect = target.getBoundingClientRect();
                overlay.style.position = 'absolute';
                overlay.style.top = `${targetRect.bottom}px`;
                overlay.style.left = `${targetRect.left}px`;
            }
        }
    };




    const handleTagChange = (fileIndex: number, tag: string) => {
        setFileTags((prevTags) => {
            const newTags = [...prevTags];
            newTags[fileIndex] = { tag }; // Actualizar el tag para el archivo específico
            return newTags;
        });

        // Ocultar el OverlayPanel
        const syntheticEvent = document.createEvent('Event');
        syntheticEvent.initEvent('click', true, true);
        overlayRefs.current[fileIndex].toggle(syntheticEvent as unknown as React.SyntheticEvent<Element, Event>);

    };

    const getUserOptions = () => {
        const empId = sessionStorage.getItem('empId');

        switch (empId) {
            case "1022":
                return ['FC', 'CCF', 'NC', 'FEX', 'FSE', 'Cancel']; // Opciones para el usuario 26
            case "2":
                return ['FC', 'CCF', 'NC', 'ND', 'CR', 'CL', 'DCL', 'FEX', 'FSE', 'CD', 'Cancel']; // Opciones para el usuario 2
            // Agregar más casos para otros empresas
            default:
                return []; // Por defecto, no hay opciones
        }
    };

    const removeFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setFileTags((prevTags) => prevTags.filter((_, i) => i !== index));
    };

    const handleClearFiles = () => {
        setFiles([]);
        setFileTags([]);
    };

    const tipoDteMapping: { [key: string]: string } = {
        'FC': '01',
        'CCF': '03',
        'NR': '04',
        'NC': '05',
        'ND': '06',
        'CR ': '07',
        'CL': '08',
        'DCL': '09',
        'FEX': '11',
        'FSE': '14',
        'CD': '15',
        'Cancel': 'cancel'
    };

    const validateFiles = () => {
        for (const tag of fileTags) {
            if (!tag.tag) {
                return false; // Hay al menos un archivo sin tag seleccionado
            }
        }
        return true; // Todos los archivos tienen tags seleccionados
    };


    const handleFileUpload = async () => {
        if (files.length === 0 || uploading) {
            toast.current?.show({
                severity: 'warn',
                summary: 'No hay archivos',
                detail: 'No hay archivos seleccionados para subir'
            });
            return;
        }

        // Validar que todos los archivos tengan un tag seleccionado
        if (!validateFiles()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Selecciona un tag',
                detail: 'Selecciona un tag para cada archivo antes de subirlos'
            });
            return;
        }


        setUploading(true);

        const token = `Bearer ${sessionStorage.getItem('AuthToken')}`;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('excel', file);

                const dteType = tipoDteMapping[fileTags[i]?.tag || '']; // Obtener el tipo de documento asociado con el tag del archivo

                const headers = {
                    'Authorization': token,
                    'tipoDte': dteType
                };

                const response = await fetch(`${import.meta.env.VITE_API_BACKEND}/convert`, {
                    method: 'POST',
                    body: formData,
                    headers: headers,
                });

                const resposneData = await response.json();

                if (response.ok) {
                    toast.current?.show({
                        severity: 'success',
                        summary: `${file.name}`,
                        detail: resposneData.message
                    });
                    setFiles(prevFiles => prevFiles.filter(prevFile => prevFile !== file));
                    setFileTags([]);
                } else {
                    console.error('Error al subir el archivo:', file.name);
                    toast.current?.show({
                        severity: 'error',
                        summary: `Error al enviar ${file.name}`,
                        detail: resposneData.error
                    });
                }
            }
        } catch (error) {
            console.error('Error al subir los archivos:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error al subir los archivos',
                detail: 'Ocurrió un error al subir los archivos'
            });
        } finally {
            setUploading(false);
        }
    };

    const tagColors: { [key: string]: string } = {
        'FC': '#6f7a51',
        'CCF': '#7b5a30',
        'NR': '#fb8500',
        'NC': '#700c0c',
        'ND': '#9f86c0',
        'CR': '#57cc99',
        'CL': '#84a98c',
        'DCL': '#4361ee',
        'FEX': '#6e5774',
        'FSE': '#917239',
        'CD': '#a3a380',
        'Cancel': '#ff0000'
    };

    const handleFileDrop = (acceptedFiles: File[]) => {
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
        setFileTags(prevTags => [...prevTags, ...acceptedFiles.map(() => ({ tag: '' }))]);
    };

    return (
        <div>
            <Toast ref={toast}></Toast>
            <div className="containerDropzone glass-container">
                <h2>ENVIO DE PLANTILLAS</h2>
                <div className='dropzone-header'>
                    <div className='d-flex justify-content-between p-2 align-items-center' style={{ marginLeft: '15px' }}>
                        <a href="https://prd.factured.sv/#/sessions/signin">
                            <img src={icon} alt="Facuted logo" className='FacturedLogo' />
                        </a>
                        <div style={{ marginRight: '10px' }}>
                            <input
                                type="file"
                                ref={inputFileRef}
                                style={{ display: 'none' }} // Ocultar el input
                                onChange={handleFileChange}
                                multiple // Permitir la selección de múltiples archivos
                            />
                            <Button
                                icon='pi pi-fw pi-upload'
                                rounded
                                text
                                raised
                                severity='secondary'
                                tooltip='Seleccionar Archivos'
                                tooltipOptions={{ position: 'top' }}
                                style={{ marginRight: '10px', borderRadius: '50%' }}
                                onClick={() => inputFileRef.current?.click()} // Llamar al método click del input al hacer clic en el botón
                            />
                            <Button
                                onClick={handleFileUpload}
                                icon='pi pi-fw pi-cloud-upload'
                                text
                                raised
                                severity='success'
                                tooltip='Subir Archivos'
                                tooltipOptions={{ position: 'top' }}
                                style={{ marginRight: '10px', borderRadius: '50%' }} // Agregar un margen entre los botones
                            />
                            <Button
                                onClick={handleClearFiles}
                                icon='pi pi-fw pi-times'
                                rounded
                                text
                                raised
                                severity='danger'
                                tooltip='Limpiar Archivos'
                                tooltipOptions={{ position: 'top' }}
                                style={{ borderRadius: '50%' }}
                            />
                        </div>
                    </div>
                </div>
                <div className='dropzone'>
                    {uploading ? (
                        <div className='flex align-items-center flex-column m-5'>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )
                        :
                        (files.length > 0 ? (
                            <div className="">
                                {files.map((file, index) => (
                                    <div className="flex align-items-center justify-content-between m-2 mb-3" key={file.name}>
                                        <div className="d-flex align-items-center" style={{ width: '40%' }}>
                                            {file.name.endsWith('.xlsx') ? (
                                                <div>
                                                    <img alt={file.name} src={xlsx} width={60} style={{ marginRight: '10px' }} />
                                                </div>
                                            ) : (
                                                <div>
                                                    <i className='pi pi-question-circle' style={{ marginRight: '10px', marginLeft: '15px', fontSize: '40px' }}></i>
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <span style={{ display: 'block', overflowWrap: 'anywhere', textAlign: 'left' }}>{file.name}</span>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center'>
                                            <div>
                                                <div onClick={(event) => handleTagClick(index, event)} style={{ marginRight: '10px', cursor: 'pointer' }}>
                                                    <Tag value={fileTags[index]?.tag || 'Seleccionar tipo'}
                                                        rounded
                                                        style={{ backgroundColor: tagColors[fileTags[index]?.tag], padding: '8px 15px' }} />
                                                </div>
                                                <OverlayPanel ref={(el) => el && (overlayRefs.current[index] = el)}>
                                                    <style>
                                                        {`
                                                        .p-dropdown-panel .p-dropdown-items {
                                                            padding-left: 0 !important; 
                                                        }
                                                    `}
                                                    </style>
                                                    <Dropdown
                                                        value={fileTags[index]?.tag || ''}
                                                        options={getUserOptions()}
                                                        onChange={(e) => handleTagChange(index, e.value)}
                                                        placeholder="Seleccione un tipo"
                                                    />
                                                </OverlayPanel>
                                            </div>
                                            <Button
                                                type="button"
                                                icon="pi pi-times"
                                                className="p-button-outlined p-button-danger"
                                                raised
                                                onClick={() => removeFile(index)}
                                                style={{ borderRadius: '50%', border: 'none' }}
                                            />
                                        </div>
                                    </div>

                                ))}
                            </div>
                        ) : (
                            <Dropzone onDrop={handleFileDrop}>
                                {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()} className="flex align-items-center flex-column m-5">
                                        <div className="mb-3">
                                            <i
                                                className="pi pi-file-excel mt-3 p-5"
                                                style={{
                                                    fontSize: '5em',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#484e58',
                                                    color: '#EEEEEE',
                                                }}
                                            ></i>
                                        </div>
                                        <div>
                                            <span
                                                style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }}
                                                className="my-5"
                                            >
                                                Arrastra y suelta el archivo aquí
                                            </span>
                                        </div>
                                        <input {...getInputProps()} />
                                    </div>
                                )}
                            </Dropzone>

                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default FormEnvio;

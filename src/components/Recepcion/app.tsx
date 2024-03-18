import React from 'react';
import FileUploadComponent from './components/Recepcion';

const App: React.FC = () => {
    return (
        <div className='mt-5'>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <FileUploadComponent />
            </div>
        </div>
    );
};

export default App;
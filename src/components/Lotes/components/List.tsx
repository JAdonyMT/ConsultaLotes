import React from 'react';
import { ListBox } from 'primereact/listbox';

interface ListProps {
    id: string;
    status: string;
}

const List: React.FC<ListProps> = ({ id, status }) => {
    const items = [{ label: `${id} : ${status}`, value: id }];

    return (
        <ListBox 
            options={items} 
            optionLabel="label" 
            optionValue="value" 
            className="p-mb p-mr-3" 
            style={{ width: '100%', height: '100%', wordWrap: 'break-word'}} 
        />
    );
};

export default List;

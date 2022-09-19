import React, {FC, useState} from 'react';
import { AutoComplete, Form, Col } from 'antd';

interface IAutoCompleteInput {
    name: string
    options: { value: string }[]
    handleOnSearch: (searchText:string) => void
    placeholder: string
}

const AutoCompleteInput:FC<IAutoCompleteInput> = ({name, options, handleOnSearch, placeholder}) => {
    const [value, setValue] = useState<string>('');

    const onChange = (data: string) => {
        setValue(data);
    };

    return (
        <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 5}} style={{marginBottom: '15px', paddingRight: '16px'}}>
            <Form.Item name={name} style={{marginRight: 0}}>
                <AutoComplete
                    value={value}
                    options={options}
                    style={{ width: '100%' }}
                    onSearch={handleOnSearch}
                    onChange={onChange}
                    placeholder={placeholder}
                />
            </Form.Item>
        </Col>

    );
};

export default AutoCompleteInput;
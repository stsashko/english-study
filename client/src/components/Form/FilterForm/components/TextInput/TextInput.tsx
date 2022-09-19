import React, {FC} from 'react';
import {Col, Form, Input} from "antd";

interface ITextInput {
    name: string
    defaultValue?: string
    placeholder?: string
    rules?: {
        required: boolean,
        message: string
    }
}

const TextInput:FC<ITextInput> = ({name, placeholder, rules={required: false, message: ''}, defaultValue}) => {
    return (
        <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 5}} style={{marginBottom: '15px'}}>
            <Form.Item
                name={name}
                rules={[rules]}
                style={{marginBottom: '0px'}}
            >
                <Input type="text" placeholder={placeholder} />
            </Form.Item>
        </Col>
    );
};

export default TextInput;
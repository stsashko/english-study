import React, {FC} from 'react';
import {Col, Input} from "antd";
import {Controller} from "react-hook-form";

interface ITextAreaModalForm {
    name: string
    placeholder?: string
    control:any
    errors:any
}

const TextAreaModalForm:FC<ITextAreaModalForm> = ({name, placeholder, control, errors}) => {
    return (
        <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}} style={{marginBottom: '15px', paddingRight: '15px'}}>
            <Controller
                name={name}
                control={control}
                defaultValue=""
                render={({field}) => (
                    <React.Fragment>
                        <div className="ant-col ant-form-item-label"><label htmlFor={name} title={name}>{placeholder}</label></div>
                        <Input.TextArea {...field} status={Boolean(errors?.[name]?.message) ? 'error' : ''} placeholder={placeholder} rows={3} />
                    </React.Fragment>
                )}
            />
        </Col>
    );
};

export default TextAreaModalForm;
import React, {FC, ReactElement} from 'react';
import {Col, Input} from "antd";
import {Controller} from "react-hook-form";

interface IInputModalForm {
    name: string
    placeholder?: string
    control:any
    errors:any
    type?:string
}

const Wrap:FC<{children:ReactElement, type:string}> = ({children, type}):ReactElement => {
    if(type === 'hidden')
        return children;
    return (
        <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}} style={{marginBottom: '15px', paddingRight: '15px'}}>{children}</Col>
    )
}

const InputModalForm:FC<IInputModalForm> = ({name, placeholder, control, errors, type='text'}) => {
    return (
        <Wrap type={type}>
            <Controller
                name={name}
                control={control}
                defaultValue=""
                render={({field}) => (
                    <React.Fragment>
                        <div className="ant-col ant-form-item-label"><label htmlFor={name} title={name}>{placeholder}</label></div>
                        <Input {...field} status={Boolean(errors?.[name]?.message) ? 'error' : ''} type={type}
                               placeholder={placeholder}/>
                    </React.Fragment>
                )}
            />
        </Wrap>
    );
};

export default InputModalForm;
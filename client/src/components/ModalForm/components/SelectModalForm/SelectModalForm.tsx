import React, {FC} from 'react';
import {Select } from "antd";
import {Controller} from "react-hook-form";

interface ISelectModalForm {
    name: string
    placeholder?: string
    control:any
    errors:any
}

const SelectModalForm:FC<ISelectModalForm> = ({name, placeholder, control, errors}) => {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue="0"
            render={({field}) => (
                <React.Fragment>
                    <div className="ant-col ant-form-item-label"><label htmlFor={name} title={name}>{placeholder}</label></div>
                    <Select {...field} status={Boolean(errors?.[name]?.message) ? 'error' : ''} placeholder={placeholder} style={{width: '100%'}}>
                        <Select.Option value="0">English words</Select.Option>
                        <Select.Option value="1">Ukrainian words</Select.Option>
                        <Select.Option value="2">English sentences</Select.Option>
                        <Select.Option value="3">Ukrainian sentences</Select.Option>
                    </Select>
                </React.Fragment>
            )}
        />
    );
};

export default SelectModalForm;
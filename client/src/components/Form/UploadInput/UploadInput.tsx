import React, {FC, useState} from "react";
import {Button, Upload, UploadProps, UploadFile } from "antd";
import {UploadOutlined} from "@mui/icons-material";
import s from "./UploadInput.module.css"

interface IProps {
    label: string
    field: any,
    isError: boolean
}

const UploadInput:FC<IProps> = ({label, field, isError}) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const propsUpload: UploadProps = {
        ...field,
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            setFileList([file]);
            return false;
        },
        fileList,
    };

    return (
        <Upload {...propsUpload}>
            <Button icon={<UploadOutlined />} danger={isError} className={s.uploadInput}>{label}</Button>
        </Upload>
    );
}

export default UploadInput;
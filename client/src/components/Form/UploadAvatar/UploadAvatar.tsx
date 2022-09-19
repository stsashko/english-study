import React, {FC} from 'react';
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {message, Upload} from 'antd';
import type {UploadChangeParam} from 'antd/es/upload';
import type {RcFile, UploadFile, UploadProps} from 'antd/es/upload/interface';

interface IUploadAvatar {
    uploadChange: (info: any) => void,
    uploadLoading: boolean,
    imageUrl: string
}

const UploadAvatar: FC<IUploadAvatar> = ({uploadChange, uploadLoading, imageUrl}) => {
    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = ["image/jpeg", "image/png", "image/jpg"].includes(file.type);
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return false;
    };

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        uploadChange(info);
    };

    const uploadButton = (
        <div>
            {uploadLoading ? <LoadingOutlined/> : <PlusOutlined/>}
            <div style={{marginTop: 8}}>Upload</div>
        </div>
    );

    return (
        <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
        >
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ maxWidth: '100%', maxHeight: '100%'}}/> : uploadButton}
        </Upload>
    );
};

export default UploadAvatar;
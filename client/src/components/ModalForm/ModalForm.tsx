import React, {FC, useMemo} from 'react';
import {Form, Modal, Row, Space, Spin} from 'antd';
import s from './ModalForm.module.css'
import AlertError from "../Form/AlertError";

interface IModalForm {
    title: string
    handleSubmitModalForm: () => void
    okText?: string
    children?: React.ReactNode,
    errors: any
    modalFormParams: any
    setModalFormParams: (param: any) => void
}

const ModalForm: FC<IModalForm> = ({
                                       title,
                                       okText = 'Save',
                                       children,
                                       handleSubmitModalForm,
                                       errors,
                                       modalFormParams,
                                       setModalFormParams
                                   }) => {

    const [form] = Form.useForm();
    const alertErrors = useMemo(() => {
        const alertErrors = [];
        if (Object.keys(errors).length > 0) {
            for (let prop in errors) {
                alertErrors.push(errors[prop]['message']);
            }
        }
        return alertErrors;
    }, [Object.keys(errors).length])

    return (
        <Modal
            title={title}
            visible={modalFormParams.visible}
            onOk={() => {
                form.submit();
            }}
            confirmLoading={modalFormParams.loadingSubmit}
            onCancel={() => {
                setModalFormParams({
                    ...modalFormParams,
                    visible: false,
                    loading: false
                })
            }}
            okText={okText}
        >
            {modalFormParams.loading ? (
                <Space size="middle" className={s.modalFormSpace}>
                    <Spin size="large"/>
                </Space>
            ) : (
                <React.Fragment>
                    <Form form={form} name="horizontal_login" layout="vertical" initialValues={modalFormParams.data}
                          onFinish={handleSubmitModalForm}>
                        <Row style={{width: '100%'}}>
                            {children}
                        </Row>
                    </Form>
                    {Object.keys(errors).length > 0 && (<AlertError errors={alertErrors} style={{marginTop: '0'}}/>)}
                </React.Fragment>
            )}
        </Modal>
    );
};

export default ModalForm;
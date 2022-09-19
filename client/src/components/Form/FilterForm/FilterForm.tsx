import React, {FC} from 'react';
import {Button, Col, Form, Row} from "antd";
import moment from "moment";

interface IFilter {
    onSubmitFilter: (data: any) => void
    onClearFilter: () => void
    initialValues?: any
    children?: React.ReactNode
}

const FilterForm: FC<IFilter> = ({onSubmitFilter, onClearFilter, initialValues, children}) => {
    const [form] = Form.useForm();

    if(initialValues?.date) {
        let d = initialValues.date.split('-');
        initialValues = {
            ...initialValues,
            date: [
                moment(new Date(d[0]), 'DD.MM.YYYY'),
                moment(new Date(d[1]), 'DD.MM.YYYY'),
            ]
        };
    }

    return (
        <Form form={form} name="horizontal_login" layout="inline" initialValues={initialValues} onFinish={onSubmitFilter}
              style={{marginBottom: '20px'}}>
            <Row style={{width: '100%'}}>
                {children}
                <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 4}} style={{marginBottom: '15px'}}>
                    <Button
                        type="primary"
                        htmlType="submit"
                    >
                        Filter
                    </Button>
                    <Button
                        style={{margin: '0 8px'}}
                        onClick={() => {
                            form.resetFields();
                            onClearFilter();
                        }}
                    >
                        Clear
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default FilterForm;
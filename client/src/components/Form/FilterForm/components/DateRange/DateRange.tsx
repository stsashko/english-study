import React, {FC} from 'react';
import {DatePicker, Space, Col, Form} from 'antd';

interface IDateRange {
    name: string
}

const DateRange:FC<IDateRange> = ({name}) => {
    return (
        <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 5}}
             style={{marginBottom: '15px', paddingRight: '16px'}}>
            <Space direction="vertical" size={12} style={{width: '100%'}}>
                <Form.Item name={name} style={{marginRight: 0}}>
                    <DatePicker.RangePicker  format={'DD.MM.YYYY'} style={{width: '100%'}}/>
                </Form.Item>
            </Space>
        </Col>
    );
};

export default DateRange;
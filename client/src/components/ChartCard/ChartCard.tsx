import React, {FC, useState} from 'react';
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Card, Col, DatePicker, message, Row, Space, Spin} from "antd";

interface IChartCard {
    title: string
    loading: boolean
    data: { name: string, success: number, fail: number }[] | []
    refetch: (obj: {date: string}) => void
    colors:[string, string]
    defaultValue: [any, any]
}

const ChartCard: FC<IChartCard> = ({title, loading, data, colors, refetch, defaultValue}) => {

    const [loadFetch, setLoadFetch] = useState<boolean>(false);

    const handleChangeDatePicker = async (dates:any) => {
        try {
            const [from, to] = dates;

            setLoadFetch(true);

            await refetch({
                date: `${from._d.toISOString().replaceAll('-', '.').split('T')[0]}-${to._d.toISOString().replaceAll('-', '.').split('T')[0]}`,
            });

            setLoadFetch(false);
        } catch (event: any) {
            message.error(event.message);
        }
    }

    const headCard = (
        <Row>
            <Col xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}>
                <div style={{padding: '0 0 5px 0'}}>{title}</div>
            </Col>
            <Col xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}} style={{textAlign: 'right'}}>
                <DatePicker.RangePicker
                    format={'DD.MM.YYYY'}
                    onChange={handleChangeDatePicker}
                    defaultValue={defaultValue}
                    allowClear={false}
                />
            </Col>
        </Row>
    );

    return (
        <Card title={headCard} bordered={false}>
            {loading || loadFetch ? (
                <Space size="middle" style={{height: 400, width: '100%', justifyContent: 'center'}}>
                    <Spin size="large" />
                </Space>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        width={500}
                        height={300}
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Bar dataKey="success" fill={colors[0]}/>
                        <Bar dataKey="fail" fill={colors[1]}/>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export default ChartCard;
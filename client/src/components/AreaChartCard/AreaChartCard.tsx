import React, {FC, useState} from 'react';
import {CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area} from "recharts";
import {Card, Col, DatePicker, message, Row, Space, Spin} from "antd";
import moment from "moment";

interface IAreaChartCard {
    title: string
    loading: boolean
    data: { name: string, GB_word: number, UA_word: number, GB_sentence: number, UA_sentence: number }[] | []
    refetch: (obj: {date: string}) => void
    colors:[string, string, string, string]
    defaultValue: [any, any]
}

const AreaChartCard: FC<IAreaChartCard> = ({title, loading, data, colors, refetch, defaultValue}) => {

    const [loadFetch, setLoadFetch] = useState<boolean>(false);

    const handleChangeDatePicker = async (dates:any) => {
        try {
            const [from, to] = dates;

            setLoadFetch(true);

            await refetch({
                date: `${moment(from._d).format('YYYY.MM')}-${moment(to._d).format('YYYY.MM')}`,
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
                    picker="month"
                    format={'YYYY.MM'}
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
                <Space size="middle" style={{height: 350, width: '100%', justifyContent: 'center'}}>
                    <Spin size="large" />
                </Space>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                        width={500}
                        height={400}
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="GB_word" stackId="1" stroke={colors[0]} fill={colors[0]} />
                        <Area type="monotone" dataKey="UA_word" stackId="1" stroke={colors[1]} fill={colors[1]} />
                        <Area type="monotone" dataKey="GB_sentence" stackId="1" stroke={colors[2]} fill={colors[2]} />
                        <Area type="monotone" dataKey="UA_sentence" stackId="1" stroke={colors[3]} fill={colors[3]}/>
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export default AreaChartCard;
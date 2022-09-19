import React, {FC} from "react";
import {Content} from "../../components/Content";
import {Row, Col} from 'antd';
import {useQuery} from "@apollo/client";
import {STATISTIC_WORD_QUERIES, STATISTIC_SENTENCE_QUERIES, STATISTIC_QUESTION_QUERIES} from "./queries";
import ChartCard from "./../../components/ChartCard";
import AreaChartCard from "./../../components/AreaChartCard";
import moment from "moment";

const DashboardPage: FC = () => {
    const TITLE = 'Dashboard';

    const {loading: loadingWords, data: dataWords, refetch: refetchWords} = useQuery(STATISTIC_WORD_QUERIES, {
        variables: {
            date: `${moment(new Date(), 'YYYY.MM.DD').subtract(7, 'days').format("YYYY.MM.DD")}-${moment(new Date(), 'YYYY.MM.DD').format("YYYY.MM.DD")}`,
        }
    });

    const {loading: loadingSentences, data: dataSentences, refetch: refetchSentences} = useQuery(STATISTIC_SENTENCE_QUERIES, {
        variables: {
            date: `${moment(new Date(), 'YYYY.MM.DD').subtract(7, 'days').format("YYYY.MM.DD")}-${moment(new Date(), 'YYYY.MM.DD').format("YYYY.MM.DD")}`,
        }
    });

    const {loading: loadingQuestions, data: dataQuestions, refetch: refetchQuestions} = useQuery(STATISTIC_QUESTION_QUERIES, {
        variables: {
            date: `${moment(new Date(), 'YYYY.MM').subtract(12, 'months').format("YYYY.MM")}-${moment(new Date(), 'YYYY.MM').format("YYYY.MM")}`,
        }
    });

    return (
        <Content title={TITLE} titlePage={TITLE}>
            <div className="site-card-wrapper">
                <Row gutter={16}>
                    <Col xs={{span: 24}} sm={{span: 24}} md={{span: 24}} lg={{span: 12}} style={{marginBottom: '16px'}}>
                        <ChartCard
                            loading={loadingWords}
                            title="Tests words"
                            data={dataWords?.statisticWord || []}
                            refetch={refetchWords}
                            colors={['#e1e90b', '#00a5f4']}
                            defaultValue={[moment(new Date(), 'DD.MM.YYYY').subtract(7, 'days'), moment(new Date(), 'DD.MM.YYYY')]}
                        />
                    </Col>
                    <Col xs={{span: 24}} sm={{span: 24}} md={{span: 24}} lg={{span: 12}} style={{marginBottom: '16px'}}>
                        <ChartCard
                            loading={loadingSentences}
                            title="Tests sentences"
                            data={dataSentences?.statisticSentence || []}
                            refetch={refetchSentences}
                            colors={['#ffa000', '#00af7a']}
                            defaultValue={[moment(new Date(), 'DD.MM.YYYY').subtract(7, 'days'), moment(new Date(), 'DD.MM.YYYY')]}
                        />
                    </Col>
                    <Col span={24}>
                        <AreaChartCard
                            loading={loadingQuestions}
                            title="Overall success"
                            data={dataQuestions?.statisticQuestion || []}
                            refetch={refetchQuestions}
                            colors={['#ffa000', '#00af7a', '#e1e90b', '#00a5f4']}
                            defaultValue={[moment(new Date(), 'YYYY.MM').startOf('month').subtract(12, 'months'), moment(new Date(), 'YYYY.MM').startOf('month')]}
                        />
                    </Col>
                </Row>
            </div>
        </Content>
    );
}

export default DashboardPage;
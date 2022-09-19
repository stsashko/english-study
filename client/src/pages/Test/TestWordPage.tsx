import React, {FC, useEffect, useState} from "react";
import {Content} from "../../components/Content";
import s from './test.module.css'

import {
    message,
    Button,
    Row,
    Col,
    Space,
    Typography,
    Form,
    Radio,
    RadioChangeEvent,
    Card,
    Badge,
    Progress,
    Tooltip,
    Result
} from 'antd';

import {SmileOutlined, FrownOutlined} from "@ant-design/icons";
import {useQuery, useMutation} from "@apollo/client";
import {RANDOM_QUESTION_WORD_QUERIES, TEST_QUERIES} from "./queries";
import {SEND_ANSWER_WITH_QUESTION_WORD_MUTATION} from "./mutations";
import {useParams, useNavigate} from "react-router-dom";
import {TESTS_ROUTE} from "./../../components/RouterConstants";

const {Title} = Typography;

interface ICurrentQuestions {
    answer: Boolean
    completed: Boolean
    customerAnswer: Boolean
    wordId: Number
    wordName: String
    wordTranscription: String
    disabled?: Boolean
    __typename?: String
}

const TestWordPage: FC = () => {
    const TITLE = 'Test';
    const {testId, lang} = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [nextDisabled, setNextDisabled] = useState<boolean>(true);
    const [nextLoading, setNextLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<[]>([]);
    const [currentQuestions, setCurrentQuestions] = useState<ICurrentQuestions[] | []>([]);
    const [successfulAnswer, setSuccessfulAnswer] = useState<boolean | null>(null);
    const [value, setValue] = useState(null);
    const [finish, setFinish] = useState<boolean>(false);
    const [disabledRadio, setDisabledRadio] = useState<boolean>(false);

    const {data, refetch} = useQuery(RANDOM_QUESTION_WORD_QUERIES, {
        variables: {
            testId: testId,
            lang: lang,
        },
        fetchPolicy: 'no-cache'
    });

    const [sendAnswer] = useMutation(SEND_ANSWER_WITH_QUESTION_WORD_MUTATION, {});

    useEffect(() => {
        if(data?.getRandomQuestionWord?.pagination)
            setPagination(data.getRandomQuestionWord.pagination);
    }, [data?.getRandomQuestionWord?.pagination]);

    useEffect(() => {
        if(data?.getRandomQuestionWord?.currentQuestions)
            setCurrentQuestions(data.getRandomQuestionWord.currentQuestions);
    }, [data?.getRandomQuestionWord?.currentQuestions]);

    const onFinish = async (dataRadio: {wordId: String}) => {
        try {
            let wordId = parseInt(dataRadio.wordId.split('-')[1]);
            const answer = await sendAnswer({
                variables: {
                    input: {
                        testId: testId,
                        lang: lang,
                        questionId: data.getRandomQuestionWord.questionId,
                        wordId,
                    },
                }
            });
            setCurrentQuestions(answer.data.sendAnswerWithQuestionWord.currentQuestions);
            setSuccessfulAnswer(answer.data.sendAnswerWithQuestionWord.success);
            setNextDisabled(false);

            if(answer.data.sendAnswerWithQuestionWord.totalQuestions == answer.data.sendAnswerWithQuestionWord.totalResponses)
                setFinish(true);
        } catch (e:any) {
            message.error(e.message);
            console.error(e);
        }
    };

    const onChange = async (e: RadioChangeEvent) => {
        try {
            setDisabledRadio(true);
            setValue(e.target.value);
            let wordId = parseInt(e.target.value.split('-')[1]);
            const answer = await sendAnswer({
                variables: {
                    input: {
                        testId: testId,
                        lang: lang,
                        questionId: data.getRandomQuestionWord.questionId,
                        wordId,
                    },
                }
            });
            setCurrentQuestions(answer.data.sendAnswerWithQuestionWord.currentQuestions);
            setSuccessfulAnswer(answer.data.sendAnswerWithQuestionWord.success);
            setNextDisabled(false);

            if(answer.data.sendAnswerWithQuestionWord.totalQuestions == answer.data.sendAnswerWithQuestionWord.totalResponses)
                setFinish(true);
        } catch (e:any) {
            message.error(e.message);
            console.error(e);
        }
    };

    const handleNextQuestion = async () => {
        setDisabledRadio(false);
        setNextLoading(true);
        await refetch();
        setNextLoading(false);
        setNextDisabled(true);
        setValue(null);
        setSuccessfulAnswer(null);
    }

    if(data?.getRandomQuestionWord?.testIsOver)
        return (
            <Result
                icon={Math.ceil(data.getRandomQuestionWord.totalSuccesses * 100 / data.getRandomQuestionWord.totalResponses) >= 80 ? <SmileOutlined style={{color:'#52c41a'}} /> : <FrownOutlined style={{color:'#ff4d4f'}} />}
                title={(
                    <div>
                        <div>Your rating</div>
                        <Progress percent={100} strokeColor="red" success={{ percent: Math.ceil(data.getRandomQuestionWord.totalSuccesses * 100 / data.getRandomQuestionWord.totalResponses) }} type="circle" format={() => Math.ceil(data.getRandomQuestionWord.totalSuccesses * 100 / data.getRandomQuestionWord.totalResponses)} />
                    </div>
                )}
                extra={[
                    <Button onClick={() => navigate(`/${TESTS_ROUTE}`)} type="primary" key="got-to-tests">Go to the list of tests</Button>
                ]}
            />
        );

    return (
        <Content title={TITLE} titlePage={TITLE}>
            <Title level={3} className={s.title}>Choose the correct answer:</Title>
            {pagination.length > 0 && (
                <Space style={{
                    backgroundColor: '#fff',
                    padding: '15px 10px',
                    width: '100%',
                    justifyContent: 'center',
                    flexWrap: "wrap"
                }}>
                    {pagination.map((item:any) => (
                        <Badge count={item.number} key={item.number} style={{
                            backgroundColor: !item.completed ? '#ccc' : (item.success ? '#52c41a' : 'red'),
                            outline: item.current ? 'solid 2px #1890ff' : 'none'
                        }}/>
                    ))}
                </Space>
            )}
            <Form
                form={form}
                labelCol={{span: 4}}
                wrapperCol={{span: 14}}
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
                {currentQuestions.length > 0 && (
                    <Card title={<Tooltip title={data.getRandomQuestionWord.transcription} placement="right"><span style={successfulAnswer !== null ? {color: successfulAnswer ? '#52c41a' : 'red'} : {}}>{data.getRandomQuestionWord.word}</span></Tooltip>} headStyle={{fontSize: '20px', textAlign: 'center', fontWeight: 'bold'}}>
                        <Form.Item name="wordId" noStyle>
                            <Radio.Group onChange={onChange} className={s.radioGroup} value={value}>
                                <Row>
                                    {currentQuestions.map((item: any) => (
                                        <Col key={`${data.getRandomQuestionWord.questionId}-${item.wordId}`} span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}}
                                             lg={{span: 12}} style={{marginBottom: '15px', paddingRight: '15px'}}>
                                            <Tooltip title="right answer" visible={(successfulAnswer !== null && item.answer)} placement="left"
                                                     color={'#52c41a'}>
                                                <div><Radio disabled={disabledRadio && value !== `${data.getRandomQuestionWord.questionId}-${item.wordId}`} value={`${data.getRandomQuestionWord.questionId}-${item.wordId}`} className={s.radio + ` ${successfulAnswer === false && item.customerAnswer ? s.radioError : ''} ${successfulAnswer === true && item.customerAnswer ? s.radioValidating : ''}`}><Tooltip title={!data.getRandomQuestionWord.transcription ? item.wordTranscription : ''} placement="right"><span>{item.wordName}</span></Tooltip></Radio></div>
                                            </Tooltip>
                                        </Col>
                                    ))}
                                </Row>
                            </Radio.Group>
                        </Form.Item>

                        <Row style={{maxWidth: '650px', margin: '0 auto'}}>
                            <Col span={24} style={{padding: '15px'}}>
                                <Button type="primary" onClick={handleNextQuestion} disabled={nextDisabled} loading={nextLoading}>
                                    {finish ? 'Finish the test' : 'Next question'}
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                )}
            </Form>
        </Content>
    );
};

export default TestWordPage;
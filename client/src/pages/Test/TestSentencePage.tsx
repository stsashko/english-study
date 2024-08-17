import React, { FC, useEffect, useState } from "react";
import { Content } from "../../components/Content";
import s from "./test.module.css";
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
  Result,
} from "antd";
import {
  SmileOutlined,
  FrownOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

import { useQuery, useMutation } from "@apollo/client";
import { RANDOM_QUESTION_SENTENCE_QUERIES, TEST_QUERIES } from "./queries";
import { SEND_ANSWER_WITH_QUESTION_SENTENCE_MUTATION } from "./mutations";
import { useParams, useNavigate } from "react-router-dom";
import { TESTS_ROUTE } from "./../../components/RouterConstants";

const { Title } = Typography;

const TestSentencePage: FC = () => {
  const TITLE_PAGE = "Test";

  const { testId, lang } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const [nextDisabled, setNextDisabled] = useState<boolean>(true);
  const [nextLoading, setNextLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<{
    sentence: String;
    answer: String;
  } | null>(null);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [successfulAnswer, setSuccessfulAnswer] = useState<boolean | null>(
    null
  );
  const [value, setValue] = useState("");
  const [finish, setFinish] = useState<boolean>(false);
  const [disabledRadio, setDisabledRadio] = useState<boolean>(false);

  const { data, refetch } = useQuery(RANDOM_QUESTION_SENTENCE_QUERIES, {
    variables: {
      testId: testId,
      lang: lang,
    },
    fetchPolicy: "no-cache",
  });

  const [sendAnswer] = useMutation(
    SEND_ANSWER_WITH_QUESTION_SENTENCE_MUTATION,
    {}
  );

  useEffect(() => {
    if (data?.getRandomQuestionSentence?.pagination)
      setPagination(data.getRandomQuestionSentence.pagination);
  }, [data?.getRandomQuestionSentence?.pagination]);

  useEffect(() => {
    if (data?.getRandomQuestionSentence?.sentence) {
      let { sentence, answer } = data.getRandomQuestionSentence;
      setCurrentQuestions({
        sentence,
        answer,
      });
    }
  }, [data?.getRandomQuestionSentence?.sentence]);

  const onFinish = async (dataRadio: { rating: String }) => {
    try {
      let rating = parseInt(dataRadio.rating.split("-")[1]);
      const answer = await sendAnswer({
        variables: {
          input: {
            testId: testId,
            questionId: data.getRandomQuestionSentence.questionId,
            rating,
          },
        },
      });

      setNextDisabled(false);

      if (
        answer.data.sendAnswerWithQuestionSentence.totalQuestions ==
        answer.data.sendAnswerWithQuestionSentence.totalResponses
      )
        setFinish(true);

      setSuccessfulAnswer(
        Boolean(answer.data.sendAnswerWithQuestionSentence.success)
      );
    } catch (e: any) {
      message.error(e.message);
      console.error(e);
    }
  };

  const onChange = async (e: RadioChangeEvent) => {
    try {
      setDisabledRadio(true);
      setValue(e.target.value);

      let rating = parseInt(e.target.value.split("-")[1]);
      const answer = await sendAnswer({
        variables: {
          input: {
            testId: testId,
            questionId: data.getRandomQuestionSentence.questionId,
            rating,
          },
        },
      });

      setNextDisabled(false);

      if (
        answer.data.sendAnswerWithQuestionSentence.totalQuestions ==
        answer.data.sendAnswerWithQuestionSentence.totalResponses
      )
        setFinish(true);

      setSuccessfulAnswer(
        Boolean(answer.data.sendAnswerWithQuestionSentence.success)
      );
    } catch (e: any) {
      message.error(e.message);
      console.error(e);
    }
  };

  const handleNextQuestion = async () => {
    setDisabledRadio(false);
    setValue("");
    setShowTranslation(false);
    setNextLoading(true);
    await refetch();
    setNextLoading(false);
    setNextDisabled(true);
    setSuccessfulAnswer(null);
  };

  if (data?.getRandomQuestionSentence?.testIsOver)
    return (
      <Result
        icon={
          Math.ceil(
            (data.getRandomQuestionSentence.totalSuccesses * 100) /
              data.getRandomQuestionSentence.totalResponses
          ) >= 80 ? (
            <SmileOutlined style={{ color: "#52c41a" }} />
          ) : (
            <FrownOutlined style={{ color: "#ff4d4f" }} />
          )
        }
        title={
          <div>
            <div>Your rating</div>
            <Progress
              percent={100}
              strokeColor="red"
              success={{
                percent: Math.ceil(
                  (data.getRandomQuestionSentence.totalSuccesses * 100) /
                    data.getRandomQuestionSentence.totalResponses
                ),
              }}
              type="circle"
              format={() =>
                Math.ceil(
                  (data.getRandomQuestionSentence.totalSuccesses * 100) /
                    data.getRandomQuestionSentence.totalResponses
                )
              }
            />
          </div>
        }
        extra={[
          <Button
            onClick={() => navigate(`/${TESTS_ROUTE}`)}
            type="primary"
            key="got-to-tests"
          >
            Go to the list of tests
          </Button>,
        ]}
      />
    );

  return (
    <Content title={TITLE_PAGE} titlePage={TITLE_PAGE}>
      <Title level={3} className={s.title}>
        Translate the sentence correctly:
      </Title>
      {pagination.length > 0 && (
        <Space
          style={{
            backgroundColor: "#fff",
            padding: "15px 10px",
            width: "100%",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {pagination.map((item: any) => (
            <Badge
              count={item.number}
              key={item.number}
              style={{
                backgroundColor: !item.completed
                  ? "#ccc"
                  : item.success
                  ? "#52c41a"
                  : "red",
                outline: item.current ? "solid 2px #1890ff" : "none",
              }}
            />
          ))}
        </Space>
      )}
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        {currentQuestions && (
          <Card
            title={
              <React.Fragment>
                <div
                  className={s.sentence}
                  style={
                    successfulAnswer !== null
                      ? { color: successfulAnswer ? "#52c41a" : "red" }
                      : {}
                  }
                >
                  {currentQuestions.sentence}
                </div>
                {!showTranslation && (
                  <Button
                    type="default"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    onClick={() => setShowTranslation(true)}
                  >
                    Show translation
                  </Button>
                )}
                {showTranslation && (
                  <div className={s.answer}>{currentQuestions.answer}</div>
                )}
              </React.Fragment>
            }
            headStyle={{
              fontSize: "20px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            <Form.Item name="rating" noStyle>
              <Radio.Group
                onChange={onChange}
                className={s.radioGroup}
                value={value}
              >
                <Row>
                  <Col
                    span={4}
                    xs={{ span: 24 }}
                    sm={{ span: 12 }}
                    md={{ span: 12 }}
                    lg={{ span: 12 }}
                    style={{ marginBottom: "15px", paddingRight: "15px" }}
                  >
                    <Radio
                      value={`${data.getRandomQuestionSentence.questionId}-1`}
                      disabled={
                        disabledRadio &&
                        value !==
                          `${data.getRandomQuestionSentence.questionId}-1`
                      }
                      className={s.radio}
                    >
                      I know
                    </Radio>
                  </Col>
                  <Col
                    span={4}
                    xs={{ span: 24 }}
                    sm={{ span: 12 }}
                    md={{ span: 12 }}
                    lg={{ span: 12 }}
                    style={{ marginBottom: "15px", paddingRight: "15px" }}
                  >
                    <Radio
                      value={`${data.getRandomQuestionSentence.questionId}-0`}
                      disabled={
                        disabledRadio &&
                        value !==
                          `${data.getRandomQuestionSentence.questionId}-0`
                      }
                      className={s.radio}
                    >
                      I don't know
                    </Radio>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
            <Row style={{ maxWidth: "650px", margin: "0 auto" }}>
              <Col span={24} style={{ padding: "15px" }}>
                <Button
                  type="primary"
                  onClick={handleNextQuestion}
                  disabled={nextDisabled}
                  loading={nextLoading}
                >
                  {finish ? "Finish the test" : "Next question"}
                </Button>
              </Col>
            </Row>
          </Card>
        )}
      </Form>
    </Content>
  );
};

export default TestSentencePage;

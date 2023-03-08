import React, {FC, useState} from 'react';
import {Modal, Form, Input, Button, Progress, Row, Col, AutoComplete, Divider} from 'antd';
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {schemaWords} from "./validation";
import {IWordSentence, IWordMultiple} from "../../types/IWordSentence";
import {getPhoneticsApi, getTranslate} from "../../api/translateApi";

import useAuthData from "../../hooks/useAuthData";

type Type = {
    setOpenCreationManager: (input:boolean) => void
    handleSubmitCreationManager: (input:IWordMultiple[]) => void
}

const CreationManager: FC<Type> = ({setOpenCreationManager, handleSubmitCreationManager}) => {

    const {user} = useAuthData();

    const [progressPercent, setProgressPercent] = useState<number>(0);
    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [step, setStep] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [wordsData, setWordsData] = useState<IWordSentence[]>([]);

    const {
        control,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm({
        resolver: yupResolver(schemaWords),
    });


    const {
        control: control2,
        handleSubmit: handleSubmit2,
        formState: {errors: errors2},
        reset: reset2,
        setValue
    } = useForm({});

    const errorForm: any = errors2;

    const delay = async () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, 1000);
        });
    }

    const handleSubmitWords = async (data: any) => {
        setShowProgress(true);
        setLoading(true);
        const words = data.words.trim().split(/\r?\n/).map((i: string) => i.replaceAll(/\s+/g, ' ').trim());

        const dataWordSentence: IWordSentence[] = [];

        let i = 1;
        for (const word of words) {
            let wordsSentence: IWordSentence = {
                id: i,
                name: '',
                transcription: '',
                translation: '',
                sentenceText: '',
                sentenceTranslation: '',
                transcriptionList: [],
                sentenceTextList: [],
                sentenceTranslationList: []
            };

            let translate = await getTranslate(user.rapidApiKey, word);

            if (typeof translate !== 'undefined') {
                wordsSentence.name = translate.wordNative;
                wordsSentence.translation = translate.wordTranslate;
                wordsSentence.sentenceTextList = translate.examples.map(i => i.native);
                wordsSentence.sentenceText = wordsSentence.sentenceTextList[0];
                wordsSentence.sentenceTranslationList = translate.examples.map(i => i.translate);
                wordsSentence.sentenceTranslation = wordsSentence.sentenceTranslationList[0];
            }

            let phonetics = await getPhoneticsApi(user.rapidApiKey, word);
            if (Array.isArray(phonetics) && phonetics.length) {
                wordsSentence.transcriptionList = phonetics;
                wordsSentence.transcription = phonetics[0];
            }

            dataWordSentence.push(wordsSentence);

            setProgressPercent(Math.ceil(i * 100 / words.length));

            await delay();

            i++;
        }

        if (dataWordSentence.length) {
            setWordsData(dataWordSentence);
            setStep(2);
            setShowProgress(false);
            setLoading(false);
        }
    }

    const handleCreateWords = (data: any) => {
        setLoading(false);

        const wordsData:IWordMultiple[] = data.name.map((item:any, key:number) => {
            return ({
                name: item,
                transcription: data.transcription[key],
                translation: data.translation[key],
                sentenceText: data.sentenceText[key],
                sentenceTranslation: data.sentenceTranslation[key],
            })
        }).filter((item: IWordMultiple) => typeof item.name !== 'undefined');

        if(wordsData.length)
            handleSubmitCreationManager(wordsData);
    }

    return (
        <div>
            <Modal
                title="Creation manager"
                centered
                open={true}
                width={1000}
                onCancel={() => {
                    setOpenCreationManager(false);
                }}
                footer={[
                    (step > 1 ? <Button key="back" onClick={() => setStep(prevState => {
                        setProgressPercent(0);
                        return prevState - 1;
                    })}>Back</Button> : null),
                    <Button
                        key="next"
                        type="primary"
                        onClick={() => {
                            form.submit()
                        }}
                        loading={loading}
                    >
                        {step === 1 ? 'Start' : 'Submit'}
                    </Button>,
                ]}
            >
                {step === 1 && !showProgress && (
                    <Form form={form} name="horizontal_login" layout="vertical"
                          onFinish={handleSubmit(handleSubmitWords)}>
                        <Controller
                            name="words"
                            control={control}
                            defaultValue=""
                            render={({field}) => (
                                <Form.Item label="Words">
                                    <Input.TextArea rows={10}
                                                    status={Boolean(errors?.words?.message) ? 'error' : ''} {...field} />
                                </Form.Item>
                            )}
                        />
                    </Form>
                )}
                {showProgress && (
                    <div style={{textAlign: "center"}}>
                        <Progress type="circle" percent={progressPercent}
                                  strokeColor={{'0%': '#108ee9', '100%': '#87d068'}}/>
                    </div>
                )}
                {step === 2 && (
                    <Form form={form} name="horizontal_login" onFinish={handleSubmit2(handleCreateWords)}
                          style={{width: '100%'}}>
                        {wordsData.map(item => {
                            return (
                                <React.Fragment key={item.id}>
                                    {item.id > 1 && <Divider/>}
                                    <Row>
                                        <Col span={8} style={{padding: '5px'}}>
                                            <Controller
                                                name={`name[${item.id}]`}
                                                control={control2}
                                                defaultValue={item.name}
                                                rules={{required: true}}
                                                render={({field}) => (
                                                    <Input placeholder="Name"
                                                           status={Boolean(errorForm?.name?.[item.id]) ? 'error' : ''}  {...field} />
                                                )}
                                            />
                                        </Col>
                                        <Col span={8} style={{padding: '5px'}}>
                                            <Controller
                                                name={`transcription[${item.id}]`}
                                                control={control2}
                                                defaultValue={item.transcription}
                                                rules={{required: true}}
                                                render={({field}) => {
                                                    return (
                                                        <AutoComplete
                                                            style={{width: '100%'}}
                                                            options={item.transcriptionList.map(value => ({value}))}
                                                            status={Boolean(errorForm?.transcription?.[item.id]) ? 'error' : ''}
                                                            placeholder="Transcription"
                                                            {...field}
                                                        />
                                                    )
                                                }}
                                            />
                                        </Col>
                                        <Col span={8} style={{padding: '5px'}}>
                                            <Controller
                                                name={`translation[${item.id}]`}
                                                control={control2}
                                                defaultValue={item.translation}
                                                rules={{required: true}}
                                                render={({field}) => (
                                                    <Input placeholder="Translation"
                                                           status={Boolean(errorForm?.translation?.[item.id]) ? 'error' : ''} {...field} />
                                                )}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12} style={{padding: '5px'}}>
                                            <Controller
                                                name={`sentenceText[${item.id}]`}
                                                control={control2}
                                                defaultValue={item.sentenceText}
                                                rules={{required: true}}
                                                render={({field}) => (
                                                    <AutoComplete
                                                        style={{width: '100%'}}
                                                        options={item.sentenceTextList.map(value => ({value}))}
                                                        status={Boolean(errorForm?.sentenceText?.[item.id]) ? 'error' : ''}
                                                        placeholder="Text of the sentence"
                                                        onSelect={(value, option) => {
                                                            setValue(`sentenceTranslation[${item.id}]`, item.sentenceTranslationList[item.sentenceTextList.indexOf(value)]);
                                                        }}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </Col>
                                        <Col span={12} style={{padding: '5px'}}>
                                            <Controller
                                                name={`sentenceTranslation[${item.id}]`}
                                                control={control2}
                                                defaultValue={item.sentenceTranslation}
                                                rules={{required: true}}
                                                render={({field}) => (
                                                    <AutoComplete
                                                        style={{width: '100%'}}
                                                        options={item.sentenceTranslationList.map(value => ({value}))}
                                                        status={Boolean(errorForm?.sentenceTranslation?.[item.id]) ? 'error' : ''}
                                                        placeholder="Sentence translation"
                                                        onSelect={(value, option) => {
                                                            setValue(`sentenceText[${item.id}]`, item.sentenceTextList[item.sentenceTranslationList.indexOf(value)]);
                                                        }}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </Col>
                                    </Row>
                                </React.Fragment>
                            )
                        })}
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default CreationManager;
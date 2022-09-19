import React, {FC, useEffect, useState} from "react";
import {Content} from "../../components/Content";
import Breadcrumb from "./../../components/Breadcrumb";
import {Table, message, Button, Row, Col, Popconfirm, Divider, notification, Rate} from 'antd';
import type {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import type {FilterValue, SorterResult} from 'antd/es/table/interface';
import {PlusOutlined, DeleteOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {useQuery, useLazyQuery, useMutation} from "@apollo/client";
import {WORDS_QUERIES, WORD_QUERIES} from "./queries";
import {ADD_WORD_MUTATION, UPD_WORD_MUTATION, DEL_WORD_MUTATION, CREATE_DICTIONARY_MUTATION} from "./mutations";
import FilterForm from "./../../components/Form/FilterForm";
import {TextInput, DateRange} from "./../../components/Form/FilterForm/components";
import {useQueryURL} from "./../../hooks/useQueryURL/useQueryURL";
import useFilterUrl from "./../../hooks/useFilterUrl";
import {ModalForm, InputModalForm, TextAreaModalForm} from "./../../components/ModalForm";
import validationSchema, {validationSchemaDictionary} from "./validation";
import useModalForm from "./../../hooks/useModalForm";
import {getFilterData} from './../../helper/filter';
import Cookies from "js-cookie";

interface DataType {
    key: React.Key
    id: number
    name: string
    transcription: string
    translation: string
    rating: number
    createdAt: string
    updatedAt: string
}

const WordsPage: FC = () => {
    const TITLE = 'Word list';
    const query: any = useQueryURL();
    const {
        control,
        handleSubmit,
        errors,
        reset,
        modalFormParams,
        setModalFormParams,
    } = useModalForm(validationSchema);
    const {
        control: control2,
        handleSubmit: handleSubmit2,
        errors: errors2,
        reset: reset2,
        modalFormParams: modalFormParams2,
        setModalFormParams: setModalFormParams2,
    } = useModalForm(validationSchemaDictionary);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const [filterParams, filter, order, setFilterParams] = useFilterUrl({
        page: query.get("page") || 1,
        orderByField: query.get("orderByField") || 'id',
        orderBy: query.get("orderBy") || 'desc',
        name: query.get("name") || '',
        translation: query.get("translation") || '',
        date: query.get("date") || ''
    });

    const [pagination, setPagination] = useState<TablePaginationConfig | any>({
        current: filterParams.page ? parseInt(filterParams.page) : 1,
        pageSize: Cookies.get('pageSize') || 20,
        position: ['topRight', 'bottomRight']
    });

    const [loadingData, setLoadingData] = useState<boolean>(false);

    const {loading, data, refetch} = useQuery(WORDS_QUERIES, {
        variables: {
            filter: filter,
            orderBy: (order?.orderByField ? {[order.orderByField]: order.orderBy} : {}),
            skip: filterParams?.page ? (filterParams.page - 1) : 0,
            take: pagination.pageSize
        }
    });

    const [getWord] = useLazyQuery(WORD_QUERIES, {
        fetchPolicy: 'no-cache'
    });

    const [addWord] = useMutation(ADD_WORD_MUTATION, {});
    const [updWord] = useMutation(UPD_WORD_MUTATION, {});
    const [delWord] = useMutation(DEL_WORD_MUTATION, {});
    const [createDictionary] = useMutation(CREATE_DICTIONARY_MUTATION, {});

    useEffect(() => {
        if (data?.words?.count) {
            setPagination({
                ...pagination,
                total: data?.words?.count,
            });
        }
    }, [data?.words?.count, data?.words?.data])

    const handleOpenModal = async (e: React.MouseEvent<HTMLElement>, _id: number) => {
        e.preventDefault();

        try {
            setModalFormParams({
                visible: true,
                loading: true
            });

            const word:any = await getWord({variables: {id: _id}});

            const {id, name, transcription, translation, bySentence} = word.data.getWord;
            const {id: sentenceId, text: sentenceText, translation:sentenceTranslation} = bySentence.length ? bySentence[0] : {
                id: 0, text: '', translation: ''
            };

            const data = {id, name, transcription, translation, sentenceId, sentenceText, sentenceTranslation};

            reset(data);

            setModalFormParams({
                loading: false,
                data:data
            });
        } catch (e:any) {
            message.error(e.message);
            console.error(e);
        }
    }

    const onSubmitFilter = async (data: {
        name?: string
        translation?: string
        date?:any
    }) => {
        setLoadingData(true);
        try {
            data = getFilterData(data);
            await refetch({
                filter: data,
            });
            setFilterParams(!Object.keys(data).length ? {} : {
                ...filterParams,
                ...data,
                page: 1
            });
        } catch (event: any) {
            message.error(event.message);
        }
        setLoadingData(false);
    }

    const onClearFilter = async () => {
        await onSubmitFilter({});
        setFilterParams({});
    }

    const fetchData = async (params: any) => {
        setLoadingData(true);
        const orderBy = params.sortOrder ? {[params.sortField]: params.sortOrder.replace('end', '')} : {}

        Cookies.set('pageSize', params.pagination.pageSize, {expires: 365});

        await refetch({
            take: params.pagination.pageSize,
            skip: params.pagination.current - 1,
            orderBy
        });

        setPagination({
            ...pagination,
            pageSize: params.pagination.pageSize,
            current: params.pagination.current,
        });

        setLoadingData(false);
    };

    const handleTableChange = async (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<DataType> | SorterResult<DataType[]>
    ) => {
        await fetchData({
            sortField: sorter.field as string,
            sortOrder: sorter.order as string,
            pagination: pagination,
        });
        setFilterParams({
            ...filterParams,
            orderByField: sorter?.field ? sorter.field : '',
            orderBy: sorter?.order ? sorter.order.replace('end', '') : '',
            page: pagination.current
        });
    };

    const handleSubmitModalForm = async (data: any) => {
        try {
            setModalFormParams({
                loadingSubmit: true
            });

            if(data.id === '') {
                await addWord({
                    variables: {
                        input: {
                            name: data.name,
                            transcription: data.transcription,
                            translation: data.translation,
                            sentenceId: data?.sentenceId || null,
                            sentenceText: data.sentenceText,
                            sentenceTranslation: data.sentenceTranslation,
                        },
                    }
                });

                await refetch();
            }
            else {
                await updWord({
                    variables: {
                        id: parseInt(data.id),
                        input: {
                            name: data.name,
                            transcription: data.transcription,
                            translation: data.translation,
                            sentenceId: parseInt(data.sentenceId),
                            sentenceText: data.sentenceText,
                            sentenceTranslation: data.sentenceTranslation,
                        },
                    }
                });
            }
            setModalFormParams({
                visible: false,
                loadingSubmit: false
            });
        } catch (e:any) {
            message.error(e.message);
            console.error(e)
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await delWord({variables: {id}});
            await refetch();

        } catch (e:any) {
            message.error(e.message);
            console.error(e)
        }
    }

    const columns: ColumnsType<DataType> = [
        {title: 'Id', dataIndex: 'id', sorter: true, defaultSortOrder: "descend"},
        {
            title: 'Name', dataIndex: 'name', sorter: true,
            render: (text, record, index) => {
                return (
                    <a href="#" onClick={(e) => handleOpenModal(e, record.id)}>{text}</a>
                )
            }
        },
        {title: 'Transcription', dataIndex: 'transcription', sorter: false, render: res => `[${res}]`},
        {title: 'Translation', dataIndex: 'translation', sorter: true},
        {title: 'Rating', dataIndex: 'rating', sorter: true, render: (text, record, index) => <Rate allowHalf disabled defaultValue={Number((5 * record.rating / 100).toFixed(2))} />},
        {title: 'Created at', dataIndex: 'createdAt', sorter: true},
        {title: 'Updated at', dataIndex: 'updatedAt', sorter: true},
        {title: '', dataIndex: 'delField', sorter: false, width:'50px', render: (text, record, index) => {
                return (
                    <Popconfirm
                        placement="bottomRight"
                        title="Are you sure to delete?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                )
            }},
    ];

    const handleCreateModalFormDictionary = async (data: any) => {
        try {
            setModalFormParams2({
                loadingSubmit: true
            });

            await createDictionary({
                variables: {
                    nameDictionary: data.nameDictionary,
                    wordsId: selectedRowKeys.map((i:any) => parseInt(i))
                }
            });

            setModalFormParams2({
                visible: false,
                loadingSubmit: false
            });

            notification.info({
                message: `You have successfully created dictionary`,
                placement: 'top',
                icon: <CheckCircleOutlined style={{color: '#52c41a'}} />
            });

            setSelectedRowKeys([])
        } catch (e:any) {
            message.error(e.message);
            console.error(e)
        }
    };

    return (
        <Content title={TITLE} titlePage={TITLE}>
            <Row style={{marginBottom: '20px'}}>
                <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}>
                    <Breadcrumb items={[
                        {label: `Words: ${data?.words?.count}`},
                    ]}/>
                </Col>
                <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}
                     style={{textAlign: "right"}}>
                    <Button type="primary" size="small" icon={<PlusOutlined/>} onClick={() => {
                        reset({
                            id: '', name: '', transcription: '', translation: '', sentenceId: '', sentenceText: '', sentenceTranslation: ''
                        });
                        setModalFormParams({
                            ...modalFormParams,
                            visible: true,
                        });
                    }}>
                        Add
                    </Button>
                    <Popconfirm
                        placement="bottomRight"
                        title="Are you sure to create dictionary?"
                        onConfirm={() => setModalFormParams2({visible: true})}
                        onCancel={() => setSelectedRowKeys([])}
                        okText="Yes"
                        cancelText="No"
                        disabled={!(selectedRowKeys.length > 0)}
                    >
                        <Button type="primary" style={{marginLeft: "15px"}} size="small" disabled={!(selectedRowKeys.length > 0)}>
                            Create dictionary {selectedRowKeys.length ? `[${selectedRowKeys.length}]` : ''}
                        </Button>
                    </Popconfirm>
                </Col>
            </Row>
            <FilterForm initialValues={filter} onSubmitFilter={onSubmitFilter} onClearFilter={onClearFilter}>
                <TextInput name="name" placeholder="Name"/>
                <TextInput name="translation" placeholder="Translation"/>
                <DateRange name="date" />
            </FilterForm>
            {data?.words?.data && (
                <React.Fragment>
                    <Table
                        rowSelection={{
                            selectedRowKeys,
                            onChange: onSelectChange,
                            preserveSelectedRowKeys: true
                        }}
                        columns={columns}
                        rowKey={record => record.id}
                        dataSource={data?.words?.data}
                        pagination={pagination}
                        sortDirections={["ascend", "descend"]}
                        loading={loading || loadingData}
                        onChange={handleTableChange}
                        scroll={{ x: 1000 }}
                        style={{marginTop: '-20px'}}
                    />
                </React.Fragment>
            )}
            <ModalForm errors={errors} title={'Word'} modalFormParams={modalFormParams}
                       setModalFormParams={setModalFormParams}
                       handleSubmitModalForm={handleSubmit(handleSubmitModalForm)}>
                <InputModalForm name="id" type="hidden" control={control}
                                errors={errors}/>
                <InputModalForm name="sentenceId" type="hidden" control={control}
                                errors={errors}/>
                <InputModalForm name="name" placeholder="Name" control={control} errors={errors}/>
                <InputModalForm name="transcription" placeholder="Transcription" control={control}
                                errors={errors}/>
                <InputModalForm name="translation" placeholder="Translation" control={control}
                                errors={errors}/>
                <Divider style={{margin: '10px 0'}} />
                <TextAreaModalForm name="sentenceText" placeholder="Text of the sentence" control={control} errors={errors} />
                <TextAreaModalForm name="sentenceTranslation" placeholder="Sentence translation" control={control} errors={errors} />
            </ModalForm>
            <ModalForm errors={errors2} title={'Create dictionary'} modalFormParams={modalFormParams2}
                       setModalFormParams={setModalFormParams2}
                       handleSubmitModalForm={handleSubmit2(handleCreateModalFormDictionary)}>
                <InputModalForm name="nameDictionary" placeholder="Name" control={control2} errors={errors2}/>
            </ModalForm>
        </Content>
    );
}

export default WordsPage;
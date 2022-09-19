import React, {FC, useEffect, useState} from "react";
import {Content} from "../../components/Content";
import Breadcrumb from "./../../components/Breadcrumb";
import {Table, message, Row, Col, Rate} from 'antd';
import type {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import type {FilterValue, SorterResult} from 'antd/es/table/interface';
import {useQuery, useLazyQuery, useMutation} from "@apollo/client";
import {SENTENCES_QUERIES, SENTENCE_QUERIES} from "./queries";
import {UPD_SENTENCE_MUTATION} from "./mutations";
import {WORDS_QUERIES} from "./../Word/queries";
import FilterForm from "./../../components/Form/FilterForm";
import {TextInput, DateRange, AutoCompleteInput} from "./../../components/Form/FilterForm/components";
import {useQueryURL} from "./../../hooks/useQueryURL/useQueryURL";
import useFilterUrl from "./../../hooks/useFilterUrl";
import {ModalForm, InputModalForm} from "./../../components/ModalForm";
import validationSchema from "./validation";
import useModalForm from "./../../hooks/useModalForm";
import {getFilterData} from './../../helper/filter';
import Cookies from "js-cookie";

interface DataType {
    key: React.Key
    id: number
    rating: number
    createdAt: string
    updatedAt: string
}

const SentencesPage: FC = () => {
    const TITLE = 'Sentences list';
    const query: any = useQueryURL();
    const {
        control,
        handleSubmit,
        errors,
        reset,
        modalFormParams,
        setModalFormParams,
    } = useModalForm(validationSchema);

    const [filterParams, filter, order, setFilterParams] = useFilterUrl({
        page: query.get("page") || 1,
        orderByField: query.get("orderByField") || 'id',
        orderBy: query.get("orderBy") || 'desc',
        text: query.get("text") || '',
        translation: query.get("translation") || '',
        date: query.get("date") || '',
        searchWord: query.get("searchWord") || ''
    });

    const [pagination, setPagination] = useState<TablePaginationConfig | any>({
        current: filterParams.page ? parseInt(filterParams.page) : 1,
        pageSize: Cookies.get('pageSize') || 20,
        position: ['topRight', 'bottomRight']
    });

    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [optionsWords, setOptionsWords] = useState<{value: string}[]>([]);
    const {loading, data, refetch} = useQuery(SENTENCES_QUERIES, {
        variables: {
            filter: filter,
            orderBy: (order?.orderByField ? {[order.orderByField]: order.orderBy} : {}),
            skip: filterParams?.page ? (filterParams.page - 1) : 0,
            take: pagination.pageSize
        }
    });

    const [getWords] = useLazyQuery(WORDS_QUERIES);
    const [getSentence] = useLazyQuery(SENTENCE_QUERIES);
    const [updSentence] = useMutation(UPD_SENTENCE_MUTATION, {});

    useEffect(() => {
        if (data?.sentences?.count) {
            setPagination({
                ...pagination,
                total: data?.sentences?.count,
            });
        }
    }, [data?.sentences?.count, data?.sentences?.data])

    const handleOpenModal = async (e: React.MouseEvent<HTMLElement>, _id: number) => {
        e.preventDefault();

        try {
            setModalFormParams({
                visible: true,
                loading: true
            });

            const sentence: any = await getSentence({variables: {id: _id}});
            const {id, text, translation} = sentence.data.getSentence;
            const data = {id, text, translation};

            reset(data);

            setModalFormParams({
                loading: false,
                data: data
            });
        } catch (e: any) {
            message.error(e.message);
            console.error(e);
        }
    }

    const handleOnSearchWord = async (searchText: string) => {
        try {
            const words: any = await getWords({
                variables: {
                    filter: {
                        name: searchText
                    },
                }
            });
            setOptionsWords(words.data.words.data.map((item:any) => ({value: item.name, key: item.id})));
        } catch (e:any) {
            message.error(e.message)
            console.error(e)
        }
    }

    const onSubmitFilter = async (data: {
        text?: string
        translation?: string
        date?: any
        searchWord?: string
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
        sorter: SorterResult<DataType> | SorterResult<DataType[]>,
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
            await updSentence({
                variables: {
                    id: parseInt(data.id),
                    input: {
                        text: data.text,
                        translation: data.translation
                    },
                }
            });
            setModalFormParams({
                visible: false,
                loadingSubmit: false
            });
        } catch (e) {
            console.error(e)
        }
    };

    const columns: ColumnsType<DataType> = [
        {
            title: 'Id', dataIndex: 'id', sorter: true, defaultSortOrder: "descend", render: (text, record, index) => {
                return (
                    <a href="#" onClick={(e) => handleOpenModal(e, record.id)}>{text}</a>
                )
            }
        },
        {
            title: 'Word',
            dataIndex: 'translation',
            sorter: false,
            render: (text, record: any, index) => record.word.name
        },
        {title: 'Text', dataIndex: 'text', sorter: false},
        {title: 'Translation', dataIndex: 'translation', sorter: false},
        {title: 'Rating', dataIndex: 'rating', sorter: true, render: (text, record, index) => <Rate allowHalf disabled defaultValue={Number((5 * record.rating / 100).toFixed(2))} />},
        {title: 'Created at', dataIndex: 'createdAt', sorter: true},
        {title: 'Updated at', dataIndex: 'updatedAt', sorter: true},
    ];

    return (
        <Content title={TITLE} titlePage={TITLE}>

            <Row style={{marginBottom: '20px'}}>
                <Col span={24} xs={{span: 24}} sm={{span: 24}} md={{span: 24}} lg={{span: 24}}>
                    <Breadcrumb items={[
                        {label: 'Sentence'},
                    ]}/>
                </Col>
            </Row>

            <FilterForm initialValues={filter} onSubmitFilter={onSubmitFilter} onClearFilter={onClearFilter}>
                <AutoCompleteInput name="searchWord" handleOnSearch={handleOnSearchWord} options={optionsWords} placeholder="Word"/>
                <TextInput name="text" placeholder="Text"/>
                <TextInput name="translation" placeholder="Translation"/>
                <DateRange name="date"/>
            </FilterForm>
            {data?.sentences?.data && (
                <Table
                    columns={columns}
                    rowKey={record => record.id}
                    dataSource={data?.sentences?.data}
                    pagination={pagination}
                    sortDirections={["ascend", "descend"]}
                    loading={loading || loadingData}
                    onChange={handleTableChange}
                    scroll={{x: 1000}}
                    style={{marginTop: '-20px'}}
                />
            )}
            <ModalForm errors={errors} title={'Sentence'} modalFormParams={modalFormParams}
                       setModalFormParams={setModalFormParams}
                       handleSubmitModalForm={handleSubmit(handleSubmitModalForm)}>
                <InputModalForm name="id" type="hidden" control={control}
                                errors={errors}/>
                <InputModalForm name="text" placeholder="Text" control={control} errors={errors}/>
                <InputModalForm name="translation" placeholder="Translation" control={control}
                                errors={errors}/>
            </ModalForm>
        </Content>
    );
}

export default SentencesPage;
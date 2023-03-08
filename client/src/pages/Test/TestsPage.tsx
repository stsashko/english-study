import React, {FC, useEffect, useState} from "react";
import {Content} from "../../components/Content";
import Breadcrumb from "./../../components/Breadcrumb";
import {Table, message, Button, Row, Col, Popconfirm, Divider, Dropdown, Menu, Tooltip, Rate} from 'antd';
import type {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import type {FilterValue, SorterResult} from 'antd/es/table/interface';
import {
    CaretRightOutlined,
    ReloadOutlined,
    DeleteOutlined,
    CheckCircleTwoTone,
    QuestionCircleOutlined
} from "@ant-design/icons";

import {useQuery, useMutation} from "@apollo/client";
import {TEST_QUERIES} from "./queries";
import {RESET_FULL_TEST_MUTATION, DELETE_FULL_TEST_MUTATION} from "./mutations";
import FilterForm from "./../../components/Form/FilterForm";
import {DateRange} from "./../../components/Form/FilterForm/components";
import {useQueryURL} from "./../../hooks/useQueryURL/useQueryURL";
import useFilterUrl from "./../../hooks/useFilterUrl";
import {getFilterData} from './../../helper/filter';
import {NavLink} from "react-router-dom";
import {TEST_WORD_ROUTE, TEST_SENTENCE_ROUTE} from "./../../components/RouterConstants";
import Cookies from "js-cookie";

interface DataType {
    key: React.Key
    id: number
    rating: number
    createdAt: string
    updatedAt: string
}

const TestsPage:FC = () => {
    const TITLE = 'Test list';

    const query: any = useQueryURL();

    const [filterParams, filter, order, setFilterParams] = useFilterUrl({
        page: query.get("page") || 1,
        orderByField: query.get("orderByField") || 'id',
        orderBy: query.get("orderBy") || 'desc',
        date: query.get("date") || '',
    });

    const [pagination, setPagination] = useState<TablePaginationConfig | any>({
        current: filterParams.page ? parseInt(filterParams.page) : 1,
        pageSize: Cookies.get('pageSize') || 20,
        position: ['bottomRight']
    });

    const [loadingData, setLoadingData] = useState<boolean>(false);

    const [loadingResetBtn, setLoadingResetBtn] = useState<boolean>(false);
    const [loadingDeleteBtn, setLoadingDeleteBtn] = useState<boolean>(false);

    const {loading, data, refetch} = useQuery(TEST_QUERIES, {
        variables: {
            filter: filter,
            orderBy: (order?.orderByField ? {[order.orderByField]: order.orderBy} : {}),
            skip: filterParams?.page ? (filterParams.page - 1) : 0,
            take: pagination.pageSize
        },
        fetchPolicy: 'no-cache'
    });

    const [resetTest] = useMutation(RESET_FULL_TEST_MUTATION, {});
    const [deleteTest] = useMutation(DELETE_FULL_TEST_MUTATION, {});

    useEffect(() => {
        if (data?.tests?.count) {
            setPagination({
                ...pagination,
                total: data?.tests?.count,
            });
        }
    }, [data?.tests?.count, data?.tests?.data])

    const onSubmitFilter = async (data: {
        date?: any
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
        sorter: any,
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

    const handleResetTest = async (id: Number) => {
        try {
            setLoadingResetBtn(true);
            await resetTest({
                variables: {
                    testId: id
                }
            });
            await refetch();
            setLoadingResetBtn(false);
        } catch (event: any) {
            message.error(event.message);
        }
    }

    const handleDeleteTest = async (id: Number) => {
        try {
            setLoadingDeleteBtn(true);
            await deleteTest({
                variables: {
                    testId: id
                }
            });
            await refetch();
            setLoadingDeleteBtn(false);
        } catch (event: any) {
            message.error(event.message);
        }
    }

    const menu = (id: Number) => (
        <Menu
            items={[
                {
                    label: <NavLink to={`/${TEST_WORD_ROUTE}/${id}/ua`}>Ukrainian words</NavLink>,
                    key: '0',
                },
                {
                    label: <NavLink to={`/${TEST_WORD_ROUTE}/${id}/gb`}>English words</NavLink>,
                    key: '1',
                },
                {
                    type: 'divider',
                },
                {
                    label: <NavLink to={`/${TEST_SENTENCE_ROUTE}/${id}/ua`}>Ukrainian sentences</NavLink>,
                    key: '3',
                },
                {
                    label: <NavLink to={`/${TEST_SENTENCE_ROUTE}/${id}/gb`}>English sentences</NavLink>,
                    key: '4',
                },
            ]}
        />
    );

    const columns: ColumnsType<DataType> = [
        {
            title: 'Id', dataIndex: 'id', sorter: true, defaultSortOrder: "descend"
        },
        {
            title: '',
            dataIndex: 'navTest',
            sorter: false,
            width: '160px',
            render: (text, record: any, index) => (
                <React.Fragment>
                    <Dropdown overlay={menu(record.id)} placement="bottomLeft" trigger={['click']} arrow>
                        <Tooltip placement="topLeft" title="Start test">
                            <Button type="primary" shape="circle" icon={<CaretRightOutlined/>}
                                    style={{marginRight: '10px'}}/>
                        </Tooltip>
                    </Dropdown>
                    <Popconfirm
                        placement="bottomRight"
                        title="Are you sure to reset?"
                        onConfirm={() => handleResetTest(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip placement="topLeft" title="Reset test">
                            <Button type="primary" shape="circle" loading={loadingResetBtn} icon={<ReloadOutlined/>}
                                    style={{marginRight: '10px', backgroundColor: "#20cc0b", borderColor: "#20cc0b"}}/>
                        </Tooltip>
                    </Popconfirm>
                    <Popconfirm
                        placement="bottomRight"
                        title="Are you sure to delete?"
                        onConfirm={() => handleDeleteTest(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip placement="topLeft" title="Delete test">
                            <Button type="primary" danger shape="circle" loading={loadingDeleteBtn}
                                    icon={<DeleteOutlined/>}/>
                        </Tooltip>
                    </Popconfirm>
                </React.Fragment>
            )
        },
        {
            title: 'Dictionaries', dataIndex: 'text', sorter: false, render: (text, record: any, index) => {
                return (
                    <React.Fragment>
                        {record.testDictionary.map((item: any) => <div
                            key={item.dictionaryGroup.name}>{item.dictionaryGroup.name}</div>)}
                    </React.Fragment>
                )
            }
        },
        {
            title: 'Questions',
            dataIndex: 'questions',
            sorter: false,
            render: (text, record: any, index) => Math.round(record._count.TestQuestion / record._count.TestType)
        },
        {
            title: 'Completed', dataIndex: 'completed', sorter: false, render: (text, record: any, index) => (
                record.TestType.filter((i: any) => i.completed === 1).length === 4 ?
                    <CheckCircleTwoTone twoToneColor="#20cc0b"/> : <QuestionCircleOutlined style={{color: '#1890ff'}}/>
            )
        },
        {
            title: <div>Words <br/> en &nbsp; ua</div>,
            dataIndex: 'words',
            sorter: false,
            render: (text, record: any, index) => (
                <React.Fragment>
                    {record.TestType.filter((i: any) => i.type.includes('gb:word'))[0]['completed'] ?
                        <CheckCircleTwoTone twoToneColor="#20cc0b"/> : <QuestionCircleOutlined
                            style={{color: '#1890ff'}}/>} &nbsp; {record.TestType.filter((i: any) => i.type.includes('ua:word'))[0]['completed'] ?
                    <CheckCircleTwoTone twoToneColor="#20cc0b"/> : <QuestionCircleOutlined style={{color: '#1890ff'}}/>}
                </React.Fragment>
            )
        },
        {
            title: <div>Sentences <br/> en &nbsp; ua</div>,
            dataIndex: 'sentences',
            sorter: false,
            render: (text, record: any, index) => (
                <React.Fragment>
                    {record.TestType.filter((i: any) => i.type.includes('gb:sentence'))[0]['completed'] ?
                        <CheckCircleTwoTone twoToneColor="#20cc0b"/> : <QuestionCircleOutlined
                            style={{color: '#1890ff'}}/>} &nbsp; {record.TestType.filter((i: any) => i.type.includes('ua:sentence'))[0]['completed'] ?
                    <CheckCircleTwoTone twoToneColor="#20cc0b"/> : <QuestionCircleOutlined style={{color: '#1890ff'}}/>}
                </React.Fragment>
            )
        },
        {title: 'Rating', dataIndex: 'rating', sorter: true, render: (text, record, index) => <Rate allowHalf disabled defaultValue={Number((5 * record.rating / 100).toFixed(2))} />},
        {title: 'Created at', dataIndex: 'createdAt', sorter: true},
        {title: 'Updated at', dataIndex: 'updatedAt', sorter: true},
    ];

    return (
        <Content title={TITLE} titlePage={TITLE}>

            <Row style={{marginBottom: '20px'}}>
                <Col span={24} xs={{span: 24}} sm={{span: 24}} md={{span: 24}} lg={{span: 24}}>
                    <Breadcrumb items={[
                        {label: 'Tests'},
                    ]}/>
                </Col>
            </Row>

            <FilterForm initialValues={filter} onSubmitFilter={onSubmitFilter} onClearFilter={onClearFilter}>
                <DateRange name="date"/>
            </FilterForm>
            {data?.tests?.data && (
                <Table
                    columns={columns}
                    rowKey={record => record.id}
                    dataSource={data?.tests?.data}
                    pagination={pagination}
                    sortDirections={["ascend", "descend"]}
                    loading={loading || loadingData}
                    onChange={handleTableChange}
                    scroll={{x: 1000}}
                />
            )}
        </Content>
    );
};

export default TestsPage;
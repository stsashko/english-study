import React, {FC, useEffect, useState} from "react";

import {Content} from "../../components/Content";

import Breadcrumb from "./../../components/Breadcrumb";
import {Table, message, Button, Row, Col, Popconfirm, notification} from 'antd';
import type {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import type {FilterValue, SorterResult} from 'antd/es/table/interface';
import {PlusOutlined, DeleteOutlined, CheckCircleOutlined} from "@ant-design/icons";
import {useQuery, useLazyQuery, useMutation} from "@apollo/client";
import {DICTIONARIES_QUERIES, DICTIONARY_QUERIES} from "./queries";
import {ADD_DICTIONARY_MUTATION, UPD_DICTIONARY_MUTATION, DEL_DICTIONARY_MUTATION, CREATE_TEST_MUTATION} from "./mutations";
import FilterForm from "./../../components/Form/FilterForm";
import {TextInput, DateRange} from "./../../components/Form/FilterForm/components";
import {useQueryURL} from "./../../hooks/useQueryURL/useQueryURL";
import useFilterUrl from "./../../hooks/useFilterUrl";
import {ModalForm, InputModalForm} from "./../../components/ModalForm";
import validationSchema from "./validation";
import useModalForm from "./../../hooks/useModalForm";
import {getFilterData} from './../../helper/filter';
import {DICTIONARY_ROUTE} from "./../../components/RouterConstants";
import {NavLink} from "react-router-dom";
import Cookies from "js-cookie";

interface DataType {
    key: React.Key
    id: number
    name: string
    _count: any
    createdAt: string
    updatedAt: string
}

const DictionariesPage:FC = () => {
    const TITLE = 'Dictionaries';

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
        name: query.get("name") || '',
        date: query.get("date") || ''
    });

    const [pagination, setPagination] = useState<TablePaginationConfig | any>({
        current: filterParams.page ? parseInt(filterParams.page) : 1,
        pageSize: Cookies.get('pageSize') || 20,
        position: ['topRight', 'bottomRight']
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingCreateTest, setLoadingCreateTest] = useState<boolean>(false);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const [loadingData, setLoadingData] = useState<boolean>(false);

    const {loading, data, refetch} = useQuery(DICTIONARIES_QUERIES, {
        variables: {
            filter: filter,
            orderBy: (order?.orderByField ? {[order.orderByField]: order.orderBy} : {}),
            skip: filterParams?.page ? (filterParams.page - 1) : 0,
            take: pagination.pageSize
        }
    });

    const [getDictionary] = useLazyQuery(DICTIONARY_QUERIES, {
        fetchPolicy: 'no-cache'
    });

    const [addDictionary] = useMutation(ADD_DICTIONARY_MUTATION, {});
    const [updDictionary] = useMutation(UPD_DICTIONARY_MUTATION, {});
    const [delDictionary] = useMutation(DEL_DICTIONARY_MUTATION, {});
    const [createTest] = useMutation(CREATE_TEST_MUTATION, {});

    useEffect(() => {
        if (data?.dictionaryGroups?.count) {
            setPagination({
                ...pagination,
                total: data?.dictionaryGroups?.count,
            });
        }
    }, [data?.dictionaryGroups?.count, data?.dictionaryGroups?.data])

    const handleOpenModal = async (e: React.MouseEvent<HTMLElement>, _id: number) => {
        e.preventDefault();

        try {
            setModalFormParams({
                visible: true,
                loading: true
            });

            const dictionary:any = await getDictionary({variables: {id: _id}});
            const {id, name} = dictionary.data.getDictionaryGroup;
            const data = {id, name};

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

    const handleSubmitModalForm = async (data: any) => {
        try {
            setModalFormParams({
                loadingSubmit: true
            });

            if(data.id === '') {
                await addDictionary({
                    variables: {
                        input: {
                            name: data.name
                        },
                    }
                });

                await refetch();
            }
            else {
                await updDictionary({
                    variables: {
                        id: parseInt(data.id),
                        input: {
                            name: data.name
                        },
                    }
                });
            }

            setModalFormParams({
                visible: false,
                loadingSubmit: false
            });
        } catch (e) {
            console.error(e)
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await delDictionary({variables: {id}});
            await refetch();

        } catch (e:any) {
            message.error(e.message);
            console.error(e)
        }
    }

    const columns: ColumnsType<DataType> = [
        {
            title: 'Id', dataIndex: 'id', sorter: true, defaultSortOrder: "descend",
            render: (text, record, index) => {
                return (
                    <a href="#" onClick={(e) => handleOpenModal(e, record.id)}>{text}</a>
                )
            }
        },
        {
            title: 'Name', dataIndex: 'name', sorter: true,
            render: (text, record, index) => {
                return (
                    <NavLink to={`/${DICTIONARY_ROUTE}/${record.id}`} >{text}</NavLink>
                )
            }
        },
        {title: 'Words', dataIndex: 'words', sorter: true, render: (text, record, index) => record._count.dictionary},
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

    const handleCreateTest = async () => {
        try {
            setLoadingCreateTest(true);

            await createTest({
                variables: {
                    dictionaryGroupIds: selectedRowKeys.map((i:any) => parseInt(i))
                }
            });

            notification.info({
                message: `You have successfully created test`,
                placement: 'top',
                icon: <CheckCircleOutlined style={{color: '#52c41a'}} />
            });

            setLoadingCreateTest(false);

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
                        {label: 'Dictionaries'},
                    ]}/>
                </Col>
                <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}
                     style={{textAlign: "right"}}>
                    <Button type="primary" size="small" icon={<PlusOutlined/>} onClick={() => {
                        reset({
                            id: '', name: ''
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
                        title="Are you sure to create test?"
                        onConfirm={handleCreateTest}
                        onCancel={() => setSelectedRowKeys([])}
                        okText="Yes"
                        cancelText="No"
                        disabled={!(selectedRowKeys.length > 0)}
                    >
                        <Button type="primary" style={{marginLeft: "15px"}} size="small" disabled={!(selectedRowKeys.length > 0)} loading={loadingCreateTest}>
                            Create test {selectedRowKeys.length ? `[${selectedRowKeys.length}]` : ''}
                        </Button>
                    </Popconfirm>
                </Col>
            </Row>

            <FilterForm initialValues={filter} onSubmitFilter={onSubmitFilter} onClearFilter={onClearFilter}>
                <TextInput name="name" placeholder="Name"/>
                <DateRange name="date" />
            </FilterForm>
            {data?.dictionaryGroups?.data && (
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                    }}
                    columns={columns}
                    rowKey={record => record.id}
                    dataSource={data?.dictionaryGroups?.data}
                    pagination={pagination}
                    sortDirections={["ascend", "descend"]}
                    loading={loading || loadingData}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                    style={{marginTop: '-20px'}}
                />
            )}
            <ModalForm errors={errors} title={'Dictionary'} modalFormParams={modalFormParams}
                       setModalFormParams={setModalFormParams}
                       handleSubmitModalForm={handleSubmit(handleSubmitModalForm)}>
                <InputModalForm name="id" type="hidden" control={control}
                                errors={errors}/>
                <InputModalForm name="name" placeholder="Name" control={control} errors={errors}/>
            </ModalForm>
        </Content>
    );
};

export default DictionariesPage;
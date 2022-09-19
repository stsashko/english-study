import React, {FC, useEffect, useState} from "react";
import {Content} from "../../components/Content";
import Breadcrumb from "./../../components/Breadcrumb";
import {Table, message, Button, Row, Col, Popconfirm, Rate} from 'antd';
import type {ColumnsType, TablePaginationConfig} from 'antd/es/table';
import type {FilterValue, SorterResult} from 'antd/es/table/interface';
import {useQuery, useMutation} from "@apollo/client";
import {DICTIONARY_LIST_QUERIES} from "./queries";
import FilterForm from "./../../components/Form/FilterForm";
import {TextInput, DateRange} from "./../../components/Form/FilterForm/components";
import {useQueryURL} from "./../../hooks/useQueryURL/useQueryURL";
import useFilterUrl from "./../../hooks/useFilterUrl";
import {getFilterData} from './../../helper/filter';
import {useParams} from "react-router-dom";
import {DEL_DICTIONARY_LIST_MUTATION} from "./mutations";
import Cookies from "js-cookie";

interface DataType {
    key: React.Key
    id: number
    name: string
    word: any
    createdAt: string
    updatedAt: string
}

const DictionaryPage: FC = () => {
    const TITLE = 'Dictionary list';
    const query: any = useQueryURL();
    const {id} = useParams();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loadingDel, setLoadingDel] = useState<boolean>(false);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const [filterParams, filter, order, setFilterParams] = useFilterUrl({
        page: query.get("page") || 1,
        orderByField: query.get("orderByField") || 'id',
        orderBy: query.get("orderBy") || 'desc',
        nameWord: query.get("nameWord") || '',
        date: query.get("date") || ''
    });

    const [pagination, setPagination] = useState<TablePaginationConfig | any>({
        current: filterParams.page ? parseInt(filterParams.page) : 1,
        pageSize: Cookies.get('pageSize') || 20,
        position: ['topRight', 'bottomRight']
    });

    const [loadingData, setLoadingData] = useState<boolean>(false);

    const {loading, data, refetch} = useQuery(DICTIONARY_LIST_QUERIES, {
        variables: {
            filter: {
                ...filter,
                dictionaryGroupId: id
            },
            orderBy: (order?.orderByField ? {[order.orderByField]: order.orderBy} : {}),
            skip: filterParams?.page ? (filterParams.page - 1) : 0,
            take: pagination.pageSize
        }
    });

    const [delDictionary] = useMutation(DEL_DICTIONARY_LIST_MUTATION, {});

    useEffect(() => {
        if (data?.dictionaries?.count) {
            setPagination({
                ...pagination,
                total: data?.dictionaries?.count,
            });
        }
    }, [data?.dictionaries?.count, data?.dictionaries?.data])

    const onSubmitFilter = async (data: {
        name?: string
        translation?: string
        date?: any
    }) => {
        setLoadingData(true);
        try {
            data = getFilterData(data);

            await refetch({
                filter: {
                    ...data,
                    dictionaryGroupId: id
                },
            });

            setFilterParams(!Object.keys(data).length ? {} : {
                dictionaryGroupId: id,
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
        setFilterParams({dictionaryGroupId: id});
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
            dictionaryGroupId: id,
            ...filterParams,
            orderByField: sorter?.field ? sorter.field : '',
            orderBy: sorter?.order ? sorter.order.replace('end', '') : '',
            page: pagination.current
        });
    };

    const columns: ColumnsType<DataType> = [
        {title: 'Id', dataIndex: 'id', sorter: true, defaultSortOrder: "descend"},
        {title: 'Name', dataIndex: 'name', sorter: false, render: (text, record: any, index) => record.word.name},
        {title: 'Transcription', dataIndex: 'transcription', sorter: false, render: (text, record: any, index) => `[${record.word.transcription}]`},
        {title: 'Translation', dataIndex: 'translation', sorter: false, render: (text, record: any, index) => record.word.translation},
        {title: 'Rating', dataIndex: 'rating', sorter: false, render: (text, record, index) => <Rate allowHalf disabled defaultValue={Number((5 * record.word.rating / 100).toFixed(2))} />},
        {title: 'Created at', dataIndex: 'createdAt', sorter: true},
        {title: 'Updated at', dataIndex: 'updatedAt', sorter: true}
    ];

    const handleDelete = async () => {
        try {
            setLoadingDel(true);
            await delDictionary({
                variables: {
                    dictionaryGroupId: id,
                    ids: selectedRowKeys.map((i:any) => parseInt(i))
                }
            });
            setLoadingDel(false);
            await refetch();
            setSelectedRowKeys([]);
        } catch (e: any) {
            message.error(e.message);
            console.error(e)
        }
    }

    return (
        <Content title={TITLE} titlePage={TITLE}>

            <Row style={{marginBottom: '20px'}}>
                <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}>
                    <Breadcrumb items={[
                        {label: data?.dictionaries?.data.length ? data?.dictionaries?.data[0].dictionaryGroup?.name : 'Dictionary'},
                    ]}/>
                </Col>
                <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 12}} lg={{span: 12}}
                     style={{textAlign: "right"}}>
                    <Popconfirm
                        placement="bottomRight"
                        title="Are you sure to delete?"
                        onConfirm={handleDelete}
                        onCancel={() => setSelectedRowKeys([])}
                        okText="Yes"
                        cancelText="No"
                        disabled={!(selectedRowKeys.length > 0)}
                    >
                        <Button type="primary" danger size="small" disabled={!(selectedRowKeys.length > 0)} loading={loadingDel}>
                            Delete dictionaries {selectedRowKeys.length ? `[${selectedRowKeys.length}]` : ''}
                        </Button>
                    </Popconfirm>
                </Col>
            </Row>
            <FilterForm initialValues={filter} onSubmitFilter={onSubmitFilter} onClearFilter={onClearFilter}>
                <TextInput name="nameWord" placeholder="Name"/>
                <DateRange name="date"/>
            </FilterForm>
            {data?.dictionaries?.data && (
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                    }}
                    columns={columns}
                    rowKey={record => record.id}
                    dataSource={data?.dictionaries?.data}
                    pagination={pagination}
                    sortDirections={["ascend", "descend"]}
                    loading={loading || loadingData}
                    onChange={handleTableChange}
                    scroll={{x: 1000}}
                    style={{marginTop: '-20px'}}
                />
            )}
        </Content>
    );

};

export default DictionaryPage;
import {useEffect, useMemo, useState} from 'react';
import {createSearchParams, useNavigate} from "react-router-dom";

const useFilterUrl = (params = {}) => {

    const navigate = useNavigate();

    params = useMemo(() => {
        return Object.fromEntries(Object.entries(params).filter(([key, value]) => value !== '' && !(key === 'page' && value === 1)))
    }, [params]);

    const [filterParams, setState] = useState<any>(params);

    const filter = useMemo(() => Object.fromEntries(Object.entries(params).filter(([key, value]) => value !== '' && value !== undefined && !['page', 'orderByField', 'orderBy'].includes(key))), [params]);

    const order = useMemo(() => Object.fromEntries(Object.entries(params).filter(([key, value]) => value !== '' && value !== undefined && ['orderByField', 'orderBy'].includes(key))), [params]);

    const setFilterParams = (params: any) => {
        setState(params);
    }

    useEffect(() => {
        let params: any = Object.fromEntries(Object.entries(filterParams));
        const search:any = Object.fromEntries(Object.entries(params).filter(([key, value]) => value !== '' && !(key === 'page' && value === 1) && !(key === 'orderByField' && value === 'id') && !(key === 'orderBy' && value === 'desc')))
        navigate({
            search: createSearchParams(search).toString()
        },  { replace: true });

    }, [filterParams]);

    return [
        filterParams,
        filter,
        order,
        setFilterParams,
    ];
}

export default useFilterUrl;
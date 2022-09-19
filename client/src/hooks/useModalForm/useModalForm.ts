import {useState} from 'react';
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";

interface IParams {
    visible?: boolean
    loading?: boolean
    loadingSubmit?: boolean
    initialValues?: any
    data?: any
}

const useModalForm = (validationSchema: any) => {
    const {
        control,
        handleSubmit,
        formState: {errors},
        reset
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const defaultParams = {
        visible: false,
        loading: false,
        loadingSubmit: false,
        data: {}
    }

    const [param, setParam] = useState<IParams | null>(null);

    const setModalFormParams = (p: IParams) => {
        setParam((prev) => {
            return prev ? {
                ...prev,
                ...p
            } : p
        });
    }

    return {
        control,
        handleSubmit,
        reset,
        errors,
        setModalFormParams,
        modalFormParams: param || defaultParams,
    };
};

export default useModalForm;
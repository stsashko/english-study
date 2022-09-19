import React, {FC, useEffect} from "react";
import { useLocation } from "react-router";
import { Navigate } from "react-router-dom";
import {useQuery} from "@apollo/client";
import Layout from "./../Layouts/Layout";
import {GET_USER_QUERY} from "./queries";
import useSiteData from "./../../hooks/useSiteData";

const ProtectedRoutes:FC = () => {
    const {loading, error, data} = useQuery(GET_USER_QUERY, {
        variables: {}
    });

    const {setUser, user} = useSiteData();

    useEffect(() => {
        if(data?.getUser)
            setUser(data.getUser)
    }, [data]);

    const location = useLocation();

    return data || user?.id ? (
        <Layout />
    ) : !loading ? (
        <Navigate to="/login" replace state={{ from: location }} />
    ) : null;
};

export default ProtectedRoutes;
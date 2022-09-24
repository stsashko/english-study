import React, {useEffect, FC, ReactNode} from "react";
import {Helmet, HelmetProvider} from 'react-helmet-async';
import useSiteData from "../hooks/useSiteData";

interface IContent {
    title: string
    titlePage: string
    children: ReactNode
}

export const Content:FC<IContent> = ({children, title = '', titlePage = ''}) => {
    const {setTitlePage} = useSiteData();

    useEffect(() => {
        setTitlePage(titlePage);
    }, [titlePage, setTitlePage]);

    return (
        <HelmetProvider>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            {children}
        </HelmetProvider>
    )
}

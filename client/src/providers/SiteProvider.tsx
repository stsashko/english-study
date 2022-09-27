import React, { useMemo, useState, FC, ReactNode } from "react";
import { SiteContext } from "../contexts/SiteContext";
import { ISiteContext } from "../types/ISiteContext";

interface IHeadProviderProps  {
    children: ReactNode
}

const SiteProvider:FC<IHeadProviderProps> = (props: IHeadProviderProps) => {
    const [title, setTitle] = useState<string | boolean>(false);
    const [titlePage, setTitlePage] = useState<string | null>(null);

    const contextValue = useMemo<ISiteContext>(
        (): ISiteContext => ({
            title,
            setTitle,
            titlePage,
            setTitlePage
        }),
        [title, setTitle, titlePage, setTitlePage]
    );

    return (
        <SiteContext.Provider value={contextValue}>
            {props.children}
        </SiteContext.Provider>
    );
}

export default SiteProvider;
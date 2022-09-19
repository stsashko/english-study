import React, { useMemo, useState, FC, ReactNode } from "react";
import { SiteContext } from "../contexts/SiteContext";
import { IUser } from "../types/IUser";
import { ISiteContext } from "../types/ISiteContext";

interface IHeadProviderProps  {
    children: ReactNode
}

const SiteProvider:FC<IHeadProviderProps> = (props: IHeadProviderProps) => {
    const [title, setTitle] = useState<string | boolean>(false);
    const [titlePage, setTitlePage] = useState<string | null>(null);
    const [user, setUser] = useState<IUser | {}>({});
    const contextValue = useMemo<ISiteContext>(
        (): ISiteContext => ({
            title,
            setTitle,
            titlePage,
            setTitlePage,
            user,
            setUser,
        }),
        [title, setTitle, titlePage, setTitlePage, user, setUser]
    );
    return (
        <SiteContext.Provider value={contextValue}>
            {props.children}
        </SiteContext.Provider>
    );
}

export default SiteProvider;
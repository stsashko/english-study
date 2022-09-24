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
    const [authToken, setAuthToken] = useState<string | boolean>(false);

    const contextValue = useMemo<ISiteContext>(
        (): ISiteContext => ({
            title,
            setTitle,
            titlePage,
            setTitlePage,
            user,
            setUser,
            authToken,
            setAuthToken
        }),
        [title, setTitle, titlePage, setTitlePage, user, setUser, authToken, setAuthToken]
    );

    return (
        <SiteContext.Provider value={contextValue}>
            {props.children}
        </SiteContext.Provider>
    );
}

export default SiteProvider;
import React, { useMemo, useState, FC, ReactNode } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { IUser } from "../types/IUser";
import { IAuthContext } from "../types/IAuthContext";

interface IHeadProviderProps  {
    children: ReactNode
}

const AuthProvider:FC<IHeadProviderProps> = (props: IHeadProviderProps) => {
    const [user, setUser] = useState<IUser | {}>({});
    const [authToken, setAuthToken] = useState<string | boolean>(false);

    const contextValue = useMemo<IAuthContext>(
        (): IAuthContext => ({
            user,
            setUser
        }),
        [user, setUser, authToken, setAuthToken]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
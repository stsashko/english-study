import React, {FC, ReactNode} from 'react';
import {ApolloClient, ApolloLink, ApolloProvider, from, HttpLink, InMemoryCache} from "@apollo/client";
import PATH_API from "../../helper/pathAPI";
import Cookies from "js-cookie";
import {createUploadLink} from "apollo-upload-client";

interface IApollo {
    children: ReactNode
}

const Apollo:FC<IApollo> = ({children}) => {
    const httpLink = new HttpLink({uri: `${PATH_API}/`});

    const token = Cookies.get("auth-token");
    const localeMiddleware = new ApolloLink((operation, forward) => {
        const customHeaders = operation.getContext().hasOwnProperty("headers") ? operation.getContext().headers : {};

        operation.setContext({
            headers: {
                ...customHeaders,
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        return forward(operation);
    });

    const uploadLink = createUploadLink({
        uri: PATH_API,
        headers: {
            "keep-alive": "true",
            'Authorization': token ? `Bearer ${token}` : ''
        },
    })

    const client = new ApolloClient({
        // uri: 'http://localhost:5000/',
        link: from([localeMiddleware, uploadLink, httpLink]),
        cache: new InMemoryCache(),
        connectToDevTools: true,
    });

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
};

export default Apollo;
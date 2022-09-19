import React, { FC } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Routes, Route} from 'react-router-dom';
import ProtectedRoutes from "./components/ProtectedRoutes/index";
import {DASHBOARD_ROUTE, PROFILE_ROUTE, WORDS_ROUTE, SENTENCES_ROUTE, DICTIONARIES_ROUTE, DICTIONARY_ROUTE, TESTS_ROUTE, TEST_WORD_ROUTE, TEST_SENTENCE_ROUTE } from "./components/RouterConstants";
import {DashboardPage, LoginPage, RegisterPage, ProfilePage, WordsPage, SentencesPage, DictionariesPage, DictionaryPage, TestsPage, TestWordPage, TestSentencePage, Page404} from "./pages";
import {ApolloClient, ApolloLink, ApolloProvider, from, HttpLink, InMemoryCache} from "@apollo/client";
import {createUploadLink} from 'apollo-upload-client';
import Cookies from "js-cookie";

const App: FC = () => {
    const httpLink = new HttpLink({uri: `http://${process.env.REACT_APP_HOST_FOR_MOBILE || process.env.REACT_APP_HOST_SERVER}:${process.env.REACT_APP_NODE_SERVER_PORT}/`});

    const authToken = Cookies.get("auth-token");

    const localeMiddleware = new ApolloLink((operation, forward) => {
        const customHeaders = operation.getContext().hasOwnProperty("headers") ? operation.getContext().headers : {};

        operation.setContext({
            headers: {
                ...customHeaders,
                'Authorization': authToken ? `Bearer ${authToken}` : ''
            }
        });

        return forward(operation);
    });

    const uploadLink = createUploadLink({
        uri: `http://${process.env.REACT_APP_HOST_FOR_MOBILE || process.env.REACT_APP_HOST_SERVER}:${process.env.REACT_APP_NODE_SERVER_PORT}`,
        headers: {
            "keep-alive": "true",
            'Authorization': authToken ? `Bearer ${authToken}` : ''
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
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/login" element={<RegisterPage/>}/>
                <Route path="/register" element={<RegisterPage />}/>
                <Route path="/" element={<ProtectedRoutes/>}>
                    <Route index element={<DashboardPage/>}/>
                    <Route path={DASHBOARD_ROUTE} element={<DashboardPage/>}/>
                    <Route path={PROFILE_ROUTE} element={<ProfilePage />}/>
                    <Route path={WORDS_ROUTE} element={<WordsPage />}/>
                    <Route path={SENTENCES_ROUTE} element={<SentencesPage />}/>
                    <Route path={DICTIONARIES_ROUTE} element={<DictionariesPage />}/>
                    <Route path={`${DICTIONARY_ROUTE}/:id`}  element={<DictionaryPage />}/>
                    <Route path={TESTS_ROUTE} element={<TestsPage />} />
                    <Route path={`${TEST_WORD_ROUTE}/:testId/:lang`}  element={<TestWordPage />}/>
                    <Route path={`${TEST_SENTENCE_ROUTE}/:testId/:lang`}  element={<TestSentencePage />}/>
                </Route>
                {<Route path="*" element={<Page404 />} />}
            </Routes>
        </ApolloProvider>
    );
};

export default App;
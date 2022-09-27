import React, { FC } from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Routes, Route} from 'react-router-dom';
import ProtectedRoutes from "./components/ProtectedRoutes";
import {DASHBOARD_ROUTE, PROFILE_ROUTE, WORDS_ROUTE, SENTENCES_ROUTE, DICTIONARIES_ROUTE, DICTIONARY_ROUTE, TESTS_ROUTE, TEST_WORD_ROUTE, TEST_SENTENCE_ROUTE } from "./components/RouterConstants";
import {DashboardPage, LoginPage, RegisterPage, ProfilePage, WordsPage, SentencesPage, DictionariesPage, DictionaryPage, TestsPage, TestWordPage, TestSentencePage, Page404} from "./pages";
import Apollo from "./components/Apollo";

const App: FC = () => {
    return (
        <Apollo>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
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
        </Apollo>
    );
};

export default App;
import React, {FC} from 'react';
import { Outlet } from 'react-router-dom';
import {Layout as LayoutAntd} from "antd";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout:FC = () => {
    return (
        <LayoutAntd style={{ minHeight: '100vh' }}>
            <Sidebar />
            <LayoutAntd className="site-layout">
                <Header />
                <LayoutAntd.Content style={{ margin: '0 16px', padding: '15px 0' }}>
                    <Outlet />
                </LayoutAntd.Content>
                <Footer />
            </LayoutAntd>
        </LayoutAntd>
    );
}

export default Layout;
import React, {FC, useState} from "react";
import {NavLink, useLocation} from 'react-router-dom';
import {Layout, Menu, MenuProps} from "antd";
import {isMobile} from "react-device-detect";
import {
    PieChartOutlined,
    UnorderedListOutlined,
    ProfileOutlined
} from "@ant-design/icons";
import {DASHBOARD_ROUTE, WORDS_ROUTE, SENTENCES_ROUTE, DICTIONARIES_ROUTE, TESTS_ROUTE} from "./../RouterConstants";

import s from "./Sidebar.module.css";

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem => (
    {
        key,
        icon,
        children,
        label,
    } as MenuItem
)

const items: MenuItem[] = [
    getItem(<NavLink to={DASHBOARD_ROUTE}>Dashboard</NavLink>, 'Dashboard', <PieChartOutlined/>),
    getItem(<NavLink to={WORDS_ROUTE}>Words</NavLink>, `${WORDS_ROUTE}`, <UnorderedListOutlined/>),
    getItem(<NavLink to={SENTENCES_ROUTE}>Sentences</NavLink>, `${SENTENCES_ROUTE}`, <UnorderedListOutlined/>),
    getItem(<NavLink to={DICTIONARIES_ROUTE}>Dictionaries</NavLink>, `${DICTIONARIES_ROUTE}`, <UnorderedListOutlined/>),
    getItem(<NavLink to={TESTS_ROUTE}>Tests</NavLink>, `${TESTS_ROUTE}`, <ProfileOutlined />),
];

const Sidebar: FC = () => {
    const [collapsed, setCollapsed] = useState(isMobile);
    let {pathname} = useLocation();
    const defaultOpenKey = pathname ? pathname.substring(1).split('/').shift() : '';
    const defaultSelectedKeys:string[] = defaultOpenKey ? [defaultOpenKey] : [];

    let defaultSelectedKey = pathname.substring(1);

    return (
        <Layout.Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
            <div className="logo" style={{height: '60px'}}/>
            <Menu theme="dark" className={s.sidebar} defaultSelectedKeys={[defaultSelectedKey]} defaultOpenKeys={defaultSelectedKeys} mode="inline" items={items}/>
        </Layout.Sider>
    );
}

export default Sidebar;
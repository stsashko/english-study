import React, {FC} from "react";
import {Layout} from "antd";
import s from './Header.module.css';
import { Avatar, Dropdown, Menu } from 'antd';
import {UserOutlined} from "@ant-design/icons";
import { NavLink, useNavigate } from 'react-router-dom';
import {PROFILE_ROUTE} from "./../RouterConstants";
import useSiteData from "../../hooks/useSiteData";
import Cookies from "js-cookie";

const Header:FC = () => {
    const {titlePage, setUser, user} = useSiteData();
    const navigate = useNavigate();

    const handleLogOut = (e:React.MouseEvent<HTMLElement>):void => {
        e.preventDefault();
        setUser({});
        Cookies.remove("auth-token");
        navigate('/login');
    }

    const menu:React.ReactNode = (
        <Menu
            items={[
                {
                    key: '1',
                    label: <NavLink to={PROFILE_ROUTE}>Profile</NavLink>,
                },
                {
                    key: '2',
                    label: <a href="#" onClick={handleLogOut}>Logout</a>
                },
            ]}
        />
    );

    return (
        <Layout.Header className="site-layout-background" style={{ padding: 0, height: '60px', color:'#fff', lineHeight: '22px'}}>
            <div className={s.headerInner}>
                <h1 className={s.title}>{titlePage}</h1>
                <Dropdown
                    overlay={menu}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <div onClick={e => e.preventDefault()} style={{cursor: "pointer"}}>
                        <Avatar size="large" src={user?.image} icon={<UserOutlined />} />
                    </div>
                </Dropdown>
            </div>
        </Layout.Header>
    );
}

export default Header;
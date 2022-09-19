import React, {FC} from "react";
import {  Layout } from 'antd';

const Footer:FC = () => {
    return (
        <Layout.Footer style={{ textAlign: 'center' }}>English study ©{new Date().getFullYear()} Created by Oleksandr</Layout.Footer>
    );
}

export default Footer;
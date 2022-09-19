import React, {FC} from 'react';
import { Button, Result } from 'antd';
import {NavLink} from "react-router-dom";

const Page404:FC = () => {
    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<NavLink to={'/'}><Button type="primary">Back Home</Button></NavLink>}
        />
    );
};

export default Page404;
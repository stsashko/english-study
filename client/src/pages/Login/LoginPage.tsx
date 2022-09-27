import React, {FC, useState, useEffect} from "react";
import {Form, Input, Checkbox, Button, Col, Row, Tooltip} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {useMutation} from "@apollo/client";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import validationSchema from "./validation";
import Cookies from "js-cookie";
import {NavLink, useLocation} from "react-router-dom";
import "./../auth.css";
import s from "./LoginPage.module.css";
import {LOGIN_MUTATION} from "./mutations";
import isMobile from "is-mobile";

import useAuthData from "./../../hooks/useAuthData";
import AlertError from "./../../components/Form/AlertError";

interface CustomizedState {
    from: string
}

const LoginPage: FC = () => {
    const location = useLocation();

    const {setUser} = useAuthData();

    const [errorServer, setErrorServer] = useState<[string] | []>([]);

    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
        if (errorServer.length > 0) {
            const timer = setTimeout((): void => {
                setErrorServer([]);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [errorServer]);

    const [login, {loading}] = useMutation(LOGIN_MUTATION, {});

    const onFinish = async (data: any) => {
        try {
            const user: any = await login({
                variables: {
                    email: data.email,
                    password: data.password
                }
            });

            let options: any = {expires: data && data.remember !== false ? 365 : null};
            Cookies.set('auth-token', user.data.login.token, options);

            const state:any = location.state as CustomizedState;

            setUser(user.data.login.user);

            if (state?.from)
                window.location.href = state.from.pathname;
            else
                window.location.href = '/';

        } catch (e: any) {
            setErrorServer([e.message])
        }
    };

    const alertErrors = [];
    if (isMobile() && Object.keys(errors).length > 0) {
        for (let prop in errors) {
            alertErrors.push(errors[prop]['message']);
        }
    }

    return (
        <Row justify="center" align="middle" className="auth-box">
            <Col span={6} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 6}}>
                <h2 style={{textAlign: "center"}}>Sign in</h2>
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{remember: true}}
                    onFinish={handleSubmit(onFinish)}
                    size="large"
                >
                    <Controller
                        name="email"
                        control={control}
                        defaultValue=""
                        render={({field}) => (
                            <Tooltip placement="rightTop" title={errors?.email?.message} color="#ff4d4f"
                                     visible={!isMobile() && Boolean(errors?.email?.message)}>
                                <div>
                                    <Form.Item
                                        name="email"
                                        validateStatus={Boolean(errors?.email?.message) ? 'error' : 'validating'}
                                    >
                                        <Input {...field} type="text"
                                               prefix={<UserOutlined className="site-form-item-icon"/>}
                                               placeholder="Email"/>
                                    </Form.Item>
                                </div>
                            </Tooltip>
                        )}
                    />
                    <Controller
                        name="password"
                        control={control}
                        defaultValue=""
                        render={({field}) => (
                            <Tooltip placement="rightTop" title={errors?.password?.message} color="#ff4d4f"
                                     visible={!isMobile() && Boolean(errors?.password?.message)}>
                                <div>
                                    <Form.Item
                                        name="password"
                                        validateStatus={Boolean(errors?.password?.message) ? 'error' : 'validating'}
                                    >
                                        <Input
                                            {...field}
                                            prefix={<LockOutlined className="site-form-item-icon"/>}
                                            type="password"
                                            placeholder="Password"
                                        />
                                    </Form.Item>
                                </div>
                            </Tooltip>
                        )}
                    />
                    <Form.Item className={s.remember} style={{marginTop: '-10px'}}>
                        <Controller
                            name="remember"
                            control={control}
                            defaultValue=""
                            render={({field}) => {
                                return (
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox {...field} defaultChecked={true}>Remember me</Checkbox>
                                    </Form.Item>
                                )
                            }}
                        />
                    </Form.Item>
                    {isMobile() && Object.keys(errors).length > 0 && (<AlertError errors={alertErrors}/>)}
                    {errorServer.length > 0 && (<AlertError errors={errorServer}/>)}
                    <Form.Item>
                        <div style={{textAlign: "center"}}>
                            <Button loading={loading} type="primary" htmlType="submit" className="login-form-button"
                                    style={{marginBottom: "10px"}}>
                                Sign in
                            </Button>
                            <div><NavLink to="/register">Register</NavLink></div>
                        </div>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    );
}

export default LoginPage;
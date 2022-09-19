import React, {FC, useState, useEffect} from "react";
import {Form, Input, Button, Col, Row, Tooltip} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {useMutation} from "@apollo/client";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import validationSchema from "./validation";
import Cookies from "js-cookie";
import {NavLink, useNavigate} from "react-router-dom";
import "./../auth.css";
import {REGISTER_MUTATION} from "./mutations";
import isMobile from "is-mobile";
import useSiteData from "./../../hooks/useSiteData";
import AlertError from "./../../components/Form/AlertError";

import UploadInput from "./../../components/Form/UploadInput";

const RegisterPage: FC = () => {
    const navigate = useNavigate();
    const {setUser} = useSiteData();
    const [errorServer, setErrorServer] = useState<[string] | []>([]);
    const [loadSubmit, setLoadSubmit] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const [signup] = useMutation(REGISTER_MUTATION, {});

    useEffect(() => {
        if (errorServer.length > 0) {
            const timer = setTimeout((): void => {
                setErrorServer([]);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [errorServer]);

    const submit = async (data:any) => {
        return new Promise( async (resolve, reject) => {
            try {
                const user:any = await signup({
                    variables: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        image: data.image.file
                    }
                });
                Cookies.set('auth-token', user.data.signup.token);
                setUser(user.data.signup.user);
                resolve(true)
            } catch (e: any) {
                reject(e.message);
                setErrorServer([e.message])
            }
        });
    }

    const onFinish = async (data: any) => {
        setLoadSubmit(true);
        submit(data).then((res) => {
            setTimeout(() => {
                setLoadSubmit(false);
                navigate('/');
            }, 1000);
        })
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
                <h2 style={{textAlign: "center"}}>Register</h2>
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{remember: true}}
                    onFinish={handleSubmit(onFinish)}
                    size="large"
                    encType="multipart/form-data"
                >
                    <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        render={({field}) => (
                            <Tooltip placement="rightTop" title={errors?.name?.message} color="#ff4d4f"
                                     visible={!isMobile() && Boolean(errors?.name?.message)}>
                                <div>
                                    <Form.Item
                                        name="name"
                                        validateStatus={Boolean(errors?.name?.message) ? 'error' : 'validating'}
                                    >
                                        <Input {...field} type="text"
                                               prefix={<UserOutlined className="site-form-item-icon"/>}
                                               placeholder="Name"/>
                                    </Form.Item>
                                </div>
                            </Tooltip>
                        )}
                    />
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
                    <Controller
                        name="image"
                        control={control}
                        defaultValue=""
                        render={({field}) => (
                            <Tooltip placement="rightTop" title={errors?.image?.message} color="#ff4d4f"
                                     visible={!isMobile() && Boolean(errors?.image?.message)}>
                                <div>
                                    <Form.Item>
                                        <UploadInput label="Upload photo" field={field} isError={Boolean(errors?.image?.message)}/>
                                    </Form.Item>
                                </div>
                            </Tooltip>
                        )}
                    />
                    {isMobile() && Object.keys(errors).length > 0 && (<AlertError errors={alertErrors}/>)}
                    {errorServer.length > 0 && (<AlertError errors={errorServer}/>)}
                    <Form.Item>
                        <div style={{textAlign: "center"}}>
                            <Button loading={loadSubmit} type="primary" htmlType="submit" className="login-form-button"
                                    style={{marginBottom: "10px"}}>
                                Register now
                            </Button>
                            <div><NavLink to="/login">Sign in</NavLink></div>
                        </div>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    );
}

export default RegisterPage;
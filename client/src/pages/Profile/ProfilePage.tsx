import React, {FC, useEffect, useState} from "react";
import {Content} from "../../components/Content";
import {Button, Col, Form, Input, Row, message} from "antd";
import useAuthData from "../../hooks/useAuthData";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import validationSchema from "./validation";
import {useMutation} from "@apollo/client";
import UploadAvatar from "../../components/Form/UploadAvatar";
import {UPLOAD_AVATAR_MUTATION, PROFILE_MUTATION} from "./mutations";
import AlertError from "../../components/Form/AlertError";

const ProfilePage: FC = () => {
    const {setUser, user} = useAuthData();
    const [errorServer, setErrorServer] = useState<[string] | []>([]);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

    const {
        control,
        handleSubmit,
        formState: {errors},
        reset
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const [uploadAvatar] = useMutation(UPLOAD_AVATAR_MUTATION, {});
    const [profile, {loading}] = useMutation(PROFILE_MUTATION, {});

    useEffect(() => {
        if (errorServer.length > 0) {
            const timer = setTimeout((): void => {
                setErrorServer([]);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [errorServer]);

    useEffect(() => {
        reset({
            name: user.name,
            email: user.email
        });
    }, [reset, user]);

    const handleChangeAvatar = async (info: any) => {
        try {
            setUploadLoading(true);
            const avatar: any = await uploadAvatar({
                variables: {
                    image: info.file,
                }
            });
            setUser({
                ...user,
                image: avatar.data.uploadAvatar.image
            });

            setUploadLoading(false);
            setImageUrl(avatar.data.uploadAvatar.image);

        } catch (e: any) {
            setErrorServer([e.message])
        }
    }

    const onFinish = async (data: any) => {
        try {
            let password = {
                password: data.password || ''
            };

            const userNew: any = await profile({
                variables: {
                    name: data.name,
                    email: data.email,
                    ...password
                }
            });

            setUser({
                ...user,
                name: userNew.data.profile.name,
                email: userNew.data.profile.email
            });

            message.success('Profile changed successfully');

        } catch (e: any) {
            setErrorServer([e.message])
        }
    };

    const alertErrors = [];
    if (Object.keys(errors).length > 0) {
        for (let prop in errors) {
            alertErrors.push(errors[prop]['message']);
        }
    }

    return (
        <Content title="Profile" titlePage="Profile">
            <Form name="horizontal_login" layout="inline" onFinish={handleSubmit(onFinish)}
                  style={{marginBottom: '10px'}}
            >
                <Row style={{width: '100%'}}>
                    <Col flex="140px">
                        <UploadAvatar uploadChange={handleChangeAvatar} uploadLoading={uploadLoading}
                                      imageUrl={imageUrl || user.image}/>
                    </Col>
                    <Col flex="auto" style={{maxWidth: '700px'}}>
                        <Row style={{width: '100%', marginBottom: '20px'}}>
                            <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 9}} style={{margin:'0 15px 15px 0'}}>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({field}) => (
                                        <Input {...field} type="text" status={Boolean(errors?.name?.message) ? 'error' : ''} placeholder="Name" />
                                    )}
                                />
                            </Col>
                            <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 9}} style={{margin:'0 15px 15px 0'}}>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({field}) => (
                                        <Input {...field} type="text" status={Boolean(errors?.email?.message) ? 'error' : ''} placeholder="Email"/>
                                    )}
                                />
                            </Col>
                            <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 9}} style={{margin:'0 15px 15px 0'}}>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({field}) => (
                                        <Input {...field} type="password" status={Boolean(errors?.password?.message) ? 'error' : ''} placeholder="Password"/>
                                    )}
                                />
                            </Col>
                            <Col span={4} xs={{span: 24}} sm={{span: 12}} md={{span: 8}} lg={{span: 9}} style={{margin:'0 15px 15px 0'}}>
                                <Form.Item shouldUpdate style={{marginBottom: '10px'}}>
                                    <Button type="primary" htmlType="submit" loading={loading}>Update</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                        {Object.keys(errors).length > 0 && (<AlertError errors={alertErrors}/>)}
                        {errorServer.length > 0 && (<AlertError errors={errorServer}/>)}
                    </Col>
                </Row>
            </Form>
        </Content>
    );
}

export default ProfilePage;
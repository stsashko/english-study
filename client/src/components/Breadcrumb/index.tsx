import React, {FC} from "react";
import {Breadcrumb as BreadcrumbAntd} from 'antd';
import {useNavigate} from 'react-router-dom';

interface IBreadcrumb {
    items: IItems[]
}

interface IItems {
    label: string,
    path?: string
}

const Breadcrumb: FC<IBreadcrumb> = ({items}) => {
    const navigate = useNavigate();

    return (
        <BreadcrumbAntd>
            {items.map(item => (
                <React.Fragment key={`${item.label}-fragment`}>
                    {item.path ? (
                        <BreadcrumbAntd.Item key={item.label}>
                            <a href="#" onClick={(e:React.MouseEvent<HTMLAnchorElement>) => {
                                e.preventDefault();

                                if (item.path)
                                    navigate(item.path);
                            }}>{item.label}</a>
                        </BreadcrumbAntd.Item>
                    ) : (
                        <BreadcrumbAntd.Item key={item.label}>{item.label}</BreadcrumbAntd.Item>
                    )}
                </React.Fragment>
            ))}
        </BreadcrumbAntd>
    );
}

export default Breadcrumb;
import React, {FC} from "react";
import {Alert} from "antd";
import s from "./AlertError.module.css";

interface IProps {
    errors: Array<string>
    style?: any
}

const AlertError: FC<IProps> = ({errors, style}) => {
    return (
        <Alert message={errors.map(error => <div key={error} className={s.item}>{error}</div>)} type="error"
               showIcon style={style || {margin: '-10px 0 15px 0'}}/>
    );
}

export default AlertError;
import React from 'react';
import "./StatusNull.css";
import defaultImg from "../../svgs/avatar.png";
import logo from "../../svgs/logo.jpg";
import { useSelector } from "react-redux";

const StatusNull = () => {

    const { img, userName } = useSelector(state => state.user);
    return (
        <div className="StatusNull">
            <div className="SN-top">
                <img src={img||defaultImg} alt="" />
            </div>
            <h2>{userName}</h2>
            <div className="SN-add">
                <h1>My-Chat Status Feature</h1>
                <img src={logo} alt="" />
            </div>
        </div>
    );
};

export default StatusNull;
import React from 'react';
import "./Video.css";
import defaultImg from "../../svgs/avatar.png";
import { useSelector } from "react-redux";
import logo from "../../svgs/logo.jpg";

const CallsNull = () => {

    const { img, userName, firstName } = useSelector(state => state.user);
    return (
        <div className="CallsNull">
            <div className="CN-top">
                <img src={img||defaultImg} alt="" />
            </div>
            <h2>{userName||userName}</h2>
            <div className="CN-add">
                <h1>My-Chat Calls Features</h1>
                <img src={logo} alt="" />
            </div>
        </div>
    );
};

export default CallsNull;
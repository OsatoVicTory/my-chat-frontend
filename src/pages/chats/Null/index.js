import React from 'react';
import "./styles.css";
import defaultImg from "../../../svgs/avatar.png";
import { useSelector } from "react-redux";
import logo from "../../../svgs/logo.jpg";

const ChatNull = () => {

    const { img, userName, firstName } = useSelector(state => state.user);
    return (
        <div className="ChatNull">
            <div className="CN-top">
                <img src={img||defaultImg} alt="" />
            </div>
            <h2>{userName||firstName}</h2>
            <div className="CN-add">
                <h1>My Chat</h1>
                <img src={logo} alt="" />
            </div>
        </div>
    );
};

export default ChatNull;
import React from "react";
import "./styles.css";
import { MdCancel } from "react-icons/md";
import { AiFillCheckCircle } from "react-icons/ai";

const Alerter = ({ data }) => {

    return (
        <div className={`Alerter ${data?.type ? 'prompt' : 'terminate'}`}>
            {data?.type && <div className="Alerter-container">
                {data.type === 'error' ?
                    <MdCancel className="alerter-svg danger" /> :
                    <AiFillCheckCircle className="alerter-svg check" />
                }
                <span>{data.text}</span>
            </div>}
        </div>
    );
}

export default Alerter;
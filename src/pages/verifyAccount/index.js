import React, { useState, useEffect } from "react";
import "./styles.css";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { statusMessageActions } from "../../state";
import { verifyAccount } from "../../services/user";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/loading/loading";

const VerifyAccount = () => {

    const navigate = useNavigate();
    const { token } = useParams();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const [textType, setTextType] = useState(null);

    const handleVerify = () => {
        setLoading(true);

        verifyAccount(token).then(res => {
            setStatusMessage({type:'success', text:res.data.message});
            setLoading(false);
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        }).catch(err => {
            setLoading(false);
            setStatusMessage({type:"error", text:'Sorry Something Went Wrong. Check Internet Connection'});
        })
    }

    return (
        <div className="verifyAccount">
            <div className="vA__Top">
                <h1>MY CHAT</h1>
            </div>
            <div className="vA__Content">
                <h1>Verify Your Account</h1>
                <span className="vA__Span">
                    Weldone, All you need to do now is verify your account.
                    Click the button below to do so and get off to a flying start
                </span>
                <div className="vA__Button" onClick={handleVerify}>
                    {!loading ? 
                        <span>Verify Account</span> :
                        <LoadingSpinner width={"20px"} height={"20px"} />
                    } 
                </div>
            </div>
            <span className="vA__Med">
                Copyright @ MY CHAT {new Date().getFullYear()}
            </span>
        </div>
    )
}

export default VerifyAccount;
import React, { useState, useEffect } from 'react';
import "./login.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { statusMessageActions, userActions } from "../../state";
import { loginUser } from '../../services/user';
import LoadingSpinner from "../../components/loading/loading";
import { BsGoogle } from "react-icons/bs";
import { BsLinkedin } from "react-icons/bs";
import logo from "../../svgs/logo.jpg";

const LogInPage = () => {

    const [input, setInput] = useState({});
    const navigate = useNavigate();
    const [position, setPosition] = useState("middle");
    const [loading, setLoading] = useState(false);
    const [sticky, setSticky] = useState(false);
    const dispatch = useDispatch();
    const { statusMessage } = useSelector(state => state);
    const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
    const { setUserData } = bindActionCreators(userActions, dispatch);
    // const [textType, setTextType] = useState(null);
    const SERVER = "http://localhost:5000";

    useEffect(() => {
        if(input.email && input.password) setPosition("middle");
    }, [input])

    const handleChange = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        })
    }

    const handleHover = () => {
        if(window.innerWidth < 1000) return setPosition("middle");
        if(input.email && input.password) setPosition("middle");
        else {
            if(position==="left") setPosition("right");
            else setPosition("left");
        }
    }

    const handleOpen = (provider) => {
        window.open(`${SERVER}/api/v1/${provider}`, "_self");
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(loading) return;
        setLoading(true);

        loginUser(input).then(res => {
            setLoading(false);
            if(res.data.status === "failed") {
                setStatusMessage({type:'error',text:res.data.message});
                setTimeout(() => {
                    navigate(`/verify-account/${res.data.token}`)
                }, 1000);
                return;
            }

            setStatusMessage({type:'success',text:res.data.message});
            setUserData(res.data.user);
            navigate("/app/chat");
        }).catch(err => {
            setLoading(false);
            setStatusMessage({type:'error',text:err.response?.data.message||err.message});
            console.log(statusMessage);
        })
    }

    useEffect(() => {
        const handleScroll = () => {
            console.log(window.scrollY)
            if(window.scrollY > 40) setSticky(true);
            else setSticky(false);
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="login">
            <div className="login__Content">

                <div className={`login__Top ${sticky?"sticky":""}`}>
                    <img src={logo} />
                    <div className="lT__Left">
                        <div onClick={() => navigate("/signup")}>Sign up</div>
                        <a href="https://www.linkedin.com/in/osatohanmen-ogbeide-94377719a" 
                        className="founder">Founder</a>
                    </div>
                </div>
                <div className="login__Main"
                style={{marginTop: sticky?"75px":"30px"}}>
                    <div className="lM__Content">
                        <h1>Login To Your Account</h1>
                        <span className="login__Med"
                        style={{textAlign: "center"}}>
                            Hey, Enter your details to get signed into your account
                        </span>
                        <form onSubmit={handleSubmit}>
                            <input placeholder="Enter Email" required
                            name="email" onChange={handleChange} />
                            <input placeholder="Enter password" required 
                            name="password" type="password" onChange={handleChange} />
                            <span className="login__Small cursor"
                            onClick={() => navigate("/password-recovery")}>
                                Having trouble signing in?
                            </span>
                            <div className={`login__Button ${position}`}
                            onMouseEnter={handleHover} onMouseLeave={() => setPosition(position)}>
                                {/* <Button label={"Sign in"} loading={loading} 
                                handleClick={handleSubmit} /> */}
                                {!loading ?
                                    <input type="submit" value="Sign in" /> :
                                    <LoadingSpinner width={"14px"} height={"14px"} />
                                }
                            </div>
                        </form>
                        <span className="login__Small">
                            --Or Sign in with --
                        </span>
                        <div className="login__Providers">
                            <div onClick={() => handleOpen("google")}>
                                <BsGoogle className="lg-svg" />
                                <span className="login__SmallThick">Google</span>
                            </div>
                            <div onClick={() => handleOpen("linkedin")}>
                                <BsLinkedin className="lg-svg" /> 
                                <span className="login__SmallThick">LinkedIn</span>
                            </div>
                        </div>
                        <div className="requestSignup">
                            <span>Don't have an account ?</span>
                            <span className="login__SmallThick cursor"
                            onClick={() => navigate("/signup")}>
                                Create one now
                            </span>
                        </div>
                    </div>
                </div>
                <span className="login__Small">
                    Copyright @ MY CHAT {new Date().getFullYear()}
                </span>
            </div>
        </div>
    )
}
export default LogInPage;
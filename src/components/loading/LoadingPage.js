import React from "react";
import "./loading.css";
import LoadingSpinner from "./loading";

const LoadingPage = () => {

    return (
        <div className='LoadingPage'>
            <h2>Loading</h2>
            <div><LoadingSpinner width={'30px'} height={'30px'} /></div>
        </div>
    )
}

export default LoadingPage;
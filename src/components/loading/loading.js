import React from "react";
import "./loading.css";

const LoadingSpinner = ({ width, height }) => {

    return (
        <div className="loadingSpinner"
        style={{ width: width, height: height }}
        ></div>
    )
}

export default LoadingSpinner;
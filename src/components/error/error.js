import React from 'react';
import "./error.css";

const ErrorPage = () => {
    
    return (
        <div className="SH__Error">
            <h2>Error !</h2>
            <div className='button' onClick={()=>window.location.reload()}> 
                Reload the Page 
            </div>
        </div>
    )
};

export default ErrorPage;
import React, { useState, useEffect } from "react";

import { io } from "socket.io-client";

const Test = () => {
    const [socket, setSocket] = useState({});
    const [Loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const SERVER = "http://localhost:5000";

    useEffect(() => {
        setSocket(io(SERVER));
        console.log(socket);
    }, [])

    return (
        <div>
            <h1>Socket tester</h1>
            {socket?.on && console.log(socket)}
            {socket?.on ?
                <div>Connected</div> :
                <div>Loading...</div>
            }
        </div>
    )
}

export default Test;
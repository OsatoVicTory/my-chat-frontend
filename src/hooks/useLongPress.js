import { useState, useRef, useEffect, useCallback } from "react";

const useLongPress = (handleClick, handleLongPress, delay) => {
    
    const timeout = useRef(null);
    const isLongPress = useRef(false);
    const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    
    const start = useCallback((e, type) => {
        if((type === "mouse" && isMobile()) || (type === "touch" && !isMobile())) return;
        console.log(isMobile(), type, "start");
        isLongPress.current = false;
        timeout.current = setTimeout(() => {
            handleLongPress();  
            isLongPress.current = true;
        }, delay);  
    }, [handleLongPress, delay]);

    const stop = useCallback((e, type) => {
        if((type === "mouse" && isMobile()) || (type === "touch" && !isMobile())) return;
        console.log(isMobile(), type, "stop")
        if(timeout.current) clearTimeout(timeout.current);
        if(type === "click" && !isLongPress.current) handleClick();

    }, [handleClick]);
    
    
    return {
        onTouchStart: (e) => start(e, "touch"),
        onTouchEnd: (e) => stop(e, "touch"),
        onMouseDown: (e) => start(e, "mouse"),
        onMouseUp: (e) => stop(e, "mouse"),
        onClick: (e) => stop(e, "click"),
    };
}

export default useLongPress;
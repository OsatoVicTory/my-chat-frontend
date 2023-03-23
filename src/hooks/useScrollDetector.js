import { useEffect } from "react";

const useScrollDetector = (refEle, dist, callFunction) => {
    
    useEffect(() => {

        const ele = document.getElementById("main");
        const handleScroll = (e) => {
            callFunction(e.target.scrollTop >= dist);
        }
        if(ele) {
            ele.addEventListener("scroll", handleScroll);
        };

        return () => {
            if(ele) ele.removeEventListener("scroll", handleScroll);
        }

    }, [dist]);
}

export default useScrollDetector;
import { useEffect } from "react";

const useClickOutside = (mainRef, clickOutside) => {

    useEffect(() => {

        const clickFunc = (e) => {

            if(!mainRef.current) return;
            
            if(mainRef.current && !mainRef.current.contains(e.target)) clickOutside();
        }

        document.addEventListener("click", clickFunc, true);

        return () => document.removeEventListener("click", clickFunc, true);

    }, []);
}

export default useClickOutside;
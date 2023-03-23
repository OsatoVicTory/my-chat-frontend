import React, { useState, useRef } from "react";
import { useSwipeable } from "react-swipeable";

const useSwipe = (
    handleLeftSwipe, handleRightSwipe, gap,
    setElementId, setPos
) => {

    const config = {
        delta: 10,
        trackTouch: true,
        trackMouse: true,
        swipeDuration: 300
    }
    const Swiper = (delta) => {
        const { deltaX } = delta;
        console.log("deltaX=>",deltaX);
        setPos(deltaX);
        if(deltaX <= -gap) {
            return handleLeftSwipe();
        }
        if(deltaX >= gap) {
            handleRightSwipe();
            setTimeout(() => {
                setPos(null);
            }, 300);
        }
        // setPos(null);
    }

    const startUp = (e) => setElementId();


    const swipeEvents = useSwipeable({
        onSwipeStart: (e) => startUp(e),
        onSwiped: (deltaX) => Swiper(deltaX),
        ...config
    })

    return swipeEvents;
}

export default useSwipe;
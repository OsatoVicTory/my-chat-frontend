import { useRef, useState, useEffect } from 'react';
import './styles.css';

const Timing = ({ callAccepted }) => {

    const [callTime, setCallTime] = useState(0);
    const timeInterval = useRef();

    const formatTimeInSecs = (t) => {
        const fixZeros = (v) => v >= 10 ? v : '0'+v;
        let res = '';
        res += fixZeros(Math.floor(t / 3600)) + 'H: ';
        t %= 3600;
        res += fixZeros(Math.floor(t / 60)) + 'M: ';
        t %= 60;
        res += fixZeros(t) + 'S';
        return res;
    };

    useEffect(() => {
        if(callAccepted) {
            timeInterval.current = setInterval(() => {
                setCallTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if(timeInterval.current) clearInterval(timeInterval.current);
        }
    }, [callAccepted]);

    return (
        <h2>{formatTimeInSecs(callTime)}</h2>
    )
};

export default Timing;
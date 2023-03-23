import React from "react";

const RadialSeperators = ({ count, style }) => {

    const arr = new Array(10).fill(1);
    const turns = 1 / count;
    return (
        <>
            {arr.map((val, idx) => (
                <div key={`radial-${idx}`}
                    style={{
                        position: "absolute", height: "100%",
                        transform: `rotate(${idx * turns}turn)`
                    }}
                >
                    <div style={style} />
                </div>
            ))}
        </>
    )
}

export default RadialSeperators;
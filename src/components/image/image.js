import React from "react";
import { CircularProgressbar, 
    CircularProgressbarWithChildren, 
    buildStyles
} from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
import image from "../../svgs/avatar.png";
import RadialSeperators  from "./RadialSeperators";
import "./image.css";
import OptimizedImage from "../OptimizedImage";

const Image = ({ isStatus, len, viewed, data }) => {

    const cover = ((viewed / len) * 100).toFixed(2);
    if(isStatus) {
        return (
            <div>
                <CircularProgressbarWithChildren
                    value={cover} strokeWidth={3}
                    styles={buildStyles({
                        strokeLinecap: "butt",
                        //color of entire trail
                        trailColor: "rgb(149, 228, 246)",
                        //color of viewed arcs
                        pathColor: "grey"
                    })}
                >
                    <div className="inner-img"><OptimizedImage data={data.statusValue} /></div>
                    {/* {!data.img && <div className="circularText"
                    style={{background: data.background}}>
                        <div><span>{data.value}</span></div>
                    </div>} */}
                    <RadialSeperators
                    count={len} style={{
                        background: "#062863", width: "2px", height: "3%"
                    }}></RadialSeperators>
                </CircularProgressbarWithChildren>
            </div>
        );
    } else {
        return (
            <div>
                <img src={image} alt="" style={{width: 35, height: 35, margin: 5}} />
            </div>
        )
    }
}

export default Image;
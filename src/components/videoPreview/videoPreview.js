import React, { useState, useEffect, useRef } from "react";
import "./videoPreview.css";
import LoadingSpinner from "../loading/loading";
import { formatTime } from "../../utils/formatters";
// import VideoSnapshot from "video-snapshot";
// import SVGs from "../../svgs/SVGs";

const VideoPreview = ({ val, navigateToMedia, id, small }) => {

    const [videoCanvas, setVideoCanvas] = useState({
        snapShot: null,
    });
    const canvasRef = useRef(null);

    useEffect(() => {

        const videoEle = document.createElement("video");
        videoEle.src = val;
        const onLoad = () => {
            if(canvasRef.current>=10) return;

            const canvas = document.createElement("canvas");
            canvas.width = videoEle.videoWidth;
            canvas.height = videoEle.videoHeight;
            videoEle.currentTime = 1;
            // console.log("y");
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(videoEle, 0, 0);
            let blob = canvas.toBlob((blob) => {
                setVideoCanvas({
                    snapShot: URL.createObjectURL(blob),
                    duration: videoEle.duration
                })
                canvasRef.current = !canvasRef.current? 1: canvasRef.current + 1;
            });

        }
        videoEle.addEventListener("canplay", onLoad);

        return () => {
            videoEle.removeEventListener("load", onLoad);
            if(videoCanvas?.snapShot) URL.revokeObjectURL(videoCanvas.snapShot);
        }
    }, []);

    return (
        <div className="Media__Video">
            {videoCanvas?.snapShot && 
                <div className={`videoCanvas ${small&&"small"}`}>
                    <img src={videoCanvas.snapShot} />
                    {/* <canvas ref={canvasRef} /> */}
                    <div onClick={() => navigateToMedia(id)}>
                        play
                    </div>
                    <span>{formatTime(Math.ceil(videoCanvas.duration)||2, "secs")}</span>
                </div>
            } 
            {!videoCanvas?.snapShot && <div className="videoLoading">
                <LoadingSpinner width={"30px"} height={"30px"} />
            </div>}
            {/* {!videoCanvas?.snapShot && <div className="videoLoading">
                <LoadingSpinner width={"30px"} height={"30px"} />
            </div>} */}
        </div>
    )
}

export default VideoPreview;
import React, { useState, useRef, useEffect } from "react";
import "./Media.css";
import { useNavigate } from "react-router-dom";
// import LoadingSpinner from "../loading/loading";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { mediaActions } from "../../state/index";
import VideoPreview from "../videoPreview/videoPreview";
import OptimizedImage from "../OptimizedImage";

const Media = ({ mediaData, senderName, time, senderNumber, senderImg }) => {

    const getImgUrl = (image) => {
        if(typeof image === "object") return URL.createObjectURL(image);
        else return image;
    };
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setMediaData } = bindActionCreators(mediaActions, dispatch);
    const navigateToMedia = (id) => {
        let lists = [];
        for(var i=0;i<mediaData.length;i++) {
            lists.push({senderName, time, senderNumber, senderImg, img:mediaData[i]});
        }
        setMediaData(lists);
        navigate(`/app/media/images/${id}`);
    };

    if(mediaData.length === 1) {
        return (
            <div className="Media One">
                <div className="One" onClick={() => navigateToMedia(0)}>
                    <OptimizedImage data={mediaData[0]} />
                </div>
            </div>
        )
    } else if(mediaData.length === 2) {
        return (
            <div className="Media notOne">
                <div className="plain" onClick={() => navigateToMedia(0)}>
                    <OptimizedImage data={mediaData[0]} />
                </div>
                <div className="plain" onClick={() => navigateToMedia(1)}>
                    <OptimizedImage data={mediaData[1]} />
                </div>
            </div>
        )
    } else if(mediaData.length === 3) {
        return (
            <div className="Media notOne">
                <div className="plain" onClick={() => navigateToMedia(0)}>
                    <OptimizedImage data={mediaData[0]} />
                </div>
                <div className="columnFlex" onClick={() => navigateToMedia(1)}>
                    <OptimizedImage data={mediaData[1]} />
                    <OptimizedImage data={mediaData[2]} />
                </div>
            </div>
        )
    } else if(mediaData.length === 4) {
        return (
            <div className="Media notOne">
                <div className="columnFlex" onClick={() => navigateToMedia(0)}>
                    <OptimizedImage data={mediaData[0]} />
                    <OptimizedImage data={mediaData[1]} />
                </div>
                <div className="columnFlex" onClick={() => navigateToMedia(2)}>
                    <OptimizedImage data={mediaData[2]} />
                    <OptimizedImage data={mediaData[3]} />
                </div>
            </div>
        )
    } else {
        return (
            <div className="Media notOne">
                <div className="columnFlex" onClick={() => navigateToMedia(0)}>
                    <OptimizedImage data={mediaData[0]} />
                    <OptimizedImage data={mediaData[1]} />
                </div>
                <div className="columnFlex">
                    <OptimizedImage data={mediaData[2]} />
                    <div className="lst__Img" onClick={() => navigateToMedia(3)}>
                    <OptimizedImage data={mediaData[3]} />
                        <div className="absoluteDiv"
                        onClick={() => navigateToMedia(3)}>
                            +{mediaData.length-4}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Media;
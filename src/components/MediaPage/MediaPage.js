import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "./MediaPage.css";
import defaultImage from "../../svgs/avatar.png";
import LoadingSpinner from "../loading/loading";
// import image from "../imagess/playerPic.png";
import sender from "../../svgs/avatar.png";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { mediaActions } from "../../state/index";
import OptimizedImage from "../OptimizedImage";


const MediaPage = () => {
 
    const { user, media } = useSelector(state => state);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    console.log("enetered media page")
    const slideRef = useRef(null);
    const imageRef = useRef(null);
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true
    }


    useEffect(() => {
        console.log(media);
        if(media.length > 0) {
            if(loading) setLoading(false);
        } else return navigate("/app/chat");

        if(slideRef.current && imageRef.current !== id) {
            slideRef.current.slickGoTo(id||0);
            imageRef.current = id;
        }
    }, [media]);

    const getImgUrl = (image) => {
        if(typeof image === "object") return URL.createObjectURL(image);
        else return image;
    };

    return (
        <div className="MediaPage">
            {loading && <div className="MediaPage__Loading">
                <LoadingSpinner width={"50px"} height={"50px"} />
            </div>}
            {!loading && <div className="MediaPage__Div">
                <Slider ref={slideRef} {...settings}>
                    {media.map((val, idx) => (
                        <div className="MediaPage-main" key={`media-${idx}`}>
                            <div className="mP__Top">
                                <div className="mp__Top__L">
                                    <img src={val.senderImg||defaultImage} />
                                    <div className="mP__Txt">
                                        <span className="mP__Big">
                                            {user.contacts.find(c=>c.userId == val.senderId)?.userName||val.senderNumber}
                                        </span>
                                        <span className="mP__Small">at {val.time}</span>
                                    </div>
                                </div>
                                <div className="mP__Top__Left">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" 
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                    onClick={() => navigate(-1)} 
                                    strokeLinejoin="round" className="x" style={{color: "white"}}>
                                        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </div>
                            </div>
                            <div className="mP__Img">
                                <div className="mP__Li" key={`imgSlide-${idx}`}>
                                    <div>
                                        <OptimizedImage data={val.img} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
                {/* {media.caption && <div className="Media__Caption">{media.caption}</div>} */}
            </div>}
        </div>
    )
}

export default MediaPage;
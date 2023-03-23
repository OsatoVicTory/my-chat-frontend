import React from "react";
import "./TaggedText.css";
import { goToTaggedMessage } from "../../utils/chats";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { focusActions, messageActions } from "../../state/index";
import OptimizedImage from "../OptimizedImage";

const TaggedText = ({ taggedData, input, contactSaved }) => {

    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const { setTaggedMessage } = bindActionCreators(messageActions, dispatch);
    const { setFocusTaggedMessage } = bindActionCreators(focusActions, dispatch);
    // console.log(taggedData)

    if(input) {
        if(taggedData?.images?.length > 0) {
            return (
                <div className="MessageTag media input"
                style={{borderLeft: `5px solid ${taggedData.senderColor}`}}>
                    <div className="MessageTag__Left">
                        <div className="MessageTag__Top input">
                            <div className="senderName" style={{color: taggedData.senderColor}}>
                                {contactSaved(taggedData.senderId)?.userName||taggedData.senderNumber}
                            </div>
                        </div>
                        <div className="MessageTag__Txt">
                            {taggedData.message}
                        </div>
                    </div>
                    <div className="MT__Cancel" onClick={() => setTaggedMessage({})}
                    style={{backgroundColor: "white"}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" 
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                        strokeLinejoin="round" className="x" style={{color: "#aeaeae"}}>
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                    <div className="MessageTag__Right">
                        <OptimizedImage data={taggedData.images[0]} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="MessageTag input"
                style={{borderLeft: `5px solid ${taggedData.senderColor}`}}>
                    <div className="MessageTag__Top input"> 
                        <div className="senderName" style={{color: taggedData.senderColor}}>
                            {contactSaved(taggedData.senderId)?.userName||taggedData.senderNumber}
                        </div>
                    </div>
                    <div className="MT__Cancel" onClick={() => setTaggedMessage({})}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" 
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                        strokeLinejoin="round" className="x" style={{color: "#aeaeae"}}>
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                    <div className="MessageTag__Txt">
                        {taggedData.message||taggedData.link}
                    </div>
                </div>
            );
        }
    }
    else {
        if(taggedData?.images?.length > 0) {
            return (
                <div className="MessageTag media"
                style={{borderLeft: `5px solid ${taggedData.senderColor}`}}
                onClick={() => goToTaggedMessage(taggedData.messageId||taggedData._id, setFocusTaggedMessage)}>
                    <div className="MessageTag__Left">
                        <div className="MessageTag__Top">
                            <div className="senderName" style={{color: taggedData.senderColor}}>
                                {taggedData.senderId==user._id ?
                                    "You":
                                    contactSaved(taggedData.senderId)?.userName||taggedData.senderName
                                }
                            </div>
                            {/* {!contactSaved(taggedData.senderId) && 
                                <div className="senderNumber">{taggedData.senderNumber}
                            </div>} */}
                        </div>
                        <div className="MessageTag__Txt">
                            {taggedData.message}
                        </div>
                    </div>
                    <div className="MessageTag__Right">
                        <OptimizedImage data={taggedData.images[0]} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="MessageTag"
                style={{borderLeft: `5px solid ${taggedData.senderColor}`}}
                onClick={() => goToTaggedMessage(taggedData.messageId||taggedData._id, setFocusTaggedMessage)}>
                    <div className="MessageTag__Top">
                        <div className="senderName" style={{color: taggedData.senderColor}}>
                            {taggedData.senderId==user._id ?
                                "You":
                                contactSaved(taggedData.senderId)?.userName||taggedData.senderNumber
                            }
                        </div>
                        {/* {!contactSaved(taggedData.senderId) && 
                            <div className="senderNumber">{taggedData.senderNumber}
                        </div>} */}
                    </div>
                    <div className="MessageTag__Txt">
                        {taggedData.message||taggedData.link}
                    </div>
                </div>
            );
        }
    }

}

export default TaggedText;
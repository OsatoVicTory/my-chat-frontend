import React from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import "./emojiStyles.css";

const ReactionEmojiPicker = ({ sendEmoji, setShowEmojiPicker }) => {

    const emojiData = [
        {url: "1f4aa.png", emoji: '💪'},
        {url: "1f64f.png", emoji: '🙏'},
        {url: "2764-fe0f.png", emoji: '❤️'},
        {url: "1f44d.png", emoji: '👍'},
        // {url: "", emoji: '😢'},
        {url: "1f602.png", emoji: '😂'},
        {url: "1f62e.png", emoji: '😮'}
    ];

    return (
        <div className="reactionEmoji">
            {emojiData.map((val, idx) => (
                <div key={`REP-${idx}`} onClick={()=>sendEmoji(val.emoji)}>
                    <img src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${val.url}`} alt="" />
                </div>
            ))}
            <div onClick={setShowEmojiPicker}>
                <AiFillPlusCircle className="rep-icon" />
            </div>
        </div>
    );
}

export default ReactionEmojiPicker;
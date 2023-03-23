import React, { useEffect } from "react";
import EmojiPicker from 'emoji-picker-react';
import "./emojiStyles.css";

const Emoji = ({
    message, setMessage, key,
    refCurrent, cursorPosition, setCursorPosition
}) => {

    useEffect(() => {
        if(refCurrent) refCurrent.selectionEnd = cursorPosition;
    }, [cursorPosition]);

    const pickEmoji = (emojiObject) => {
        if(refCurrent) refCurrent.focus();
        let start, end;
        if(key) {
            start = (message[key]||'').substring(0, refCurrent.selectionStart);
            end = (message[key]||'').substring(refCurrent.selectionStart);
            setMessage({...message, [key]: start + emojiObject.emoji + end})
        } else {
            start = (message||'').substring(0, refCurrent.selectionStart);
            end = (message||'').substring(refCurrent.selectionStart);
            setMessage(start + emojiObject.emoji + end);
        }
        setCursorPosition(start.length + emojiObject.emoji.length);
    };

    return (
        <div className="Emoji">
            <EmojiPicker onEmojiClick={pickEmoji} />
        </div>
    )
};

export default Emoji;
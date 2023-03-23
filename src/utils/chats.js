export const goToTaggedMessage = (messageId, setFocusTaggedMessage) => {
    setFocusTaggedMessage(messageId)
    const ele = document.getElementById(`Message-${messageId}`);
    if(ele) ele.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
        setFocusTaggedMessage(null)
    }, 1000);
}
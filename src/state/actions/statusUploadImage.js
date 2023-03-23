export const setStatusUploadImageData = (messageData) => {
    console.log(messageData);
    return (dispatch) => {
        dispatch({
            type: "SET_STATUS_UPLOAD_IMAGE",
            payload: messageData
        })
    }
};
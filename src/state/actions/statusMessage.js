export const setStatusMessage = (messageData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_STATUS_MESSAGE",
            payload: messageData
        })
    }
}

export const setFocusTaggedMessage = (focusedMessage) => {
    return (dispatch) => {
        dispatch({
            type: "SET_FOCUSED_TAGGED_MESSAGE",
            payload: focusedMessage
        })
    }
}

export const getFocusTaggedMessage = (focusedMessage) => {
    return (dispatch) => {
        dispatch({
            type: "GET_FOCUSED_TAGGED_MESSAGE",
            payload: focusedMessage
        })
    }
}
export const setTaggedMessage = (taggedMessage) => {
    return (dispatch) => {
        dispatch({
            type: "SET_TAGGED_MESSAGE",
            payload: taggedMessage
        })
    }
}

export const getTaggedMessage = (taggedMessage) => {
    return (dispatch) => {
        dispatch({
            type: "GET_TAGGED_MESSAGE",
            payload: taggedMessage
        })
    }
}

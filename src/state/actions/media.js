export const setMediaData = (mediaData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_MEDIA_DATA",
            payload: mediaData
        })
    }
}

export const getMediaData = (mediaData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_MEDIA_DATA",
            payload: mediaData
        })
    }
}

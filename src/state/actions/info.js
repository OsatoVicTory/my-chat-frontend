export const setInfoData = (infoData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_INFO_DATA",
            payload: infoData
        })
    }
}

export const getInfoData = (infoData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_INFO_DATA",
            payload: infoData
        })
    }
}

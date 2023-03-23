export const setStatusData = (StatusData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_STATUS_DATA",
            payload: StatusData
        })
    }
}

export const getStatusData = (StatusData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_STATUS_DATA",
            payload: StatusData
        })
    }
}

export const setMyStatus = (StatusData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_MY_STATUS",
            payload: StatusData
        })
    }
}

export const deleteMyStatus = (StatusDataIndex) => {
    return (dispatch) => {
        dispatch({
            type: "DELETE_MY_STATUS",
            payload: StatusDataIndex
        })
    }
}

export const viewStatus = (StatusDataIndex) => {
    return (dispatch) => {
        dispatch({
            type: "VIEW_STATUS",
            payload: StatusDataIndex
        })
    }
}

export const setCallsData = (CallsData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_CALLS_DATA",
            payload: CallsData
        })
    }
}

export const getCallsData = (CallsData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_CALLS_DATA",
            payload: CallsData
        })
    }
}

export const clearCallsData = (CallsData) => {
    return (dispatch) => {
        dispatch({
            type: "CLEAR_CALL_DATA",
            payload: CallsData
        })
    }
}
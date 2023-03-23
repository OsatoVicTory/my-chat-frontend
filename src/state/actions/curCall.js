export const setCurCallData = (CallsData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_CUR_CALL_DATA",
            payload: CallsData
        })
    }
}
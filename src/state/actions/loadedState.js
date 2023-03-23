export const setLoadedState = (CallsData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_LOADED_STATE",
            payload: CallsData
        })
    }
}
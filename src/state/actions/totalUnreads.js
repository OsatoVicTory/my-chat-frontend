export const setTotalUnreads = (...data) => {
    switch (data[0]) {
        case -1:
            return (dispatch) => dispatch({ type:`INIT_${data[1]}`, payload: data[2] });
        case 0:
            return (dispatch) => dispatch({ type:`REMOVE_${data[1]}`, payload: data[2] });
        case 1:
            return (dispatch) => dispatch({ type:`ADD_${data[1]}`, payload: data[2] });
    }
}

export const getTotalUnreads = (totalUnreadsData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_TOTAL_UNREADS",
            payload: totalUnreadsData
        })
    }
}

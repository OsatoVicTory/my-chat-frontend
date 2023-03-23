export const setUserData = (userData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_USER_DATA",
            payload: userData
        })
    }
}

export const getUserData = (userData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_USER_DATA",
            payload: userData
        })
    }
}
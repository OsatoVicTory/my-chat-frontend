export const setGroupChatsData = (chatsData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_GROUP_DATA",
            payload: chatsData
        })
    }
}

export const getGroupChatsData = (chatsData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_GROUP_DATA",
            payload: chatsData
        })
    }
}

export const setChatsData = (chatsData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_CHATS_DATA",
            payload: chatsData
        })
    }
}

export const getChatsData = (chatsData) => {
    return (dispatch) => {
        dispatch({
            type: "GET_CHATS_DATA",
            payload: chatsData
        })
    }
}

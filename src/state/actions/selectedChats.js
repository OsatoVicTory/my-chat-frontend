export const setSelectedChats = (chatsData) => {
    return (dispatch) => {
        dispatch({
            type: "SET_SELECTED_CHATS",
            payload: chatsData
        })
    }
}

export const deleteSelectedChats = (chatsData) => {
    return (dispatch) => {
        dispatch({
            type: "DELETE_SELECTED_CHATS",
            payload: []
        })
    }
}
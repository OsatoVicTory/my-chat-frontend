const chatReducer = (state = [], action) => {
    switch (action.type) {
        case "GET_CHATS_DATA":
            return state
        case "SET_CHATS_DATA":
            return [...action.payload];
        default:
            return state
    }
}

export default chatReducer;
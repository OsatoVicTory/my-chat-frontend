const selectedChatsReducer = (state = [], action) => {
    switch (action.type) {
        case "GET_SELECTED_CHATS":
            return state
        case "SET_SELECTED_CHATS":
            return [...action.payload];
            case 'DELETE_SELECTED_CHATS':
                return [];
        default:
            return state
    }
}

export default selectedChatsReducer;
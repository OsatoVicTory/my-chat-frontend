const groupsReducer = (state = [], action) => {
    switch (action.type) {
        case "GET_GROUP_DATA":
            return state
        case "SET_GROUP_DATA":
            return [...action.payload];
        default:
            return state
    }
}

export default groupsReducer;
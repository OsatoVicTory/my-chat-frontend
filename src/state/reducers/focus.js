const focusReducer = (state = null, action) => {
    switch (action.type) {
        case "GET_FOCUSED_TAGGED_MESSAGE":
            return state
        case "SET_FOCUSED_TAGGED_MESSAGE":
            return action.payload
        default:
            return state
    }
}

export default focusReducer;
const callsReducer = (state = [], action) => {
    switch (action.type) {
        case "GET_CALLS_DATA":
            return [...action.payload]
        case "SET_CALLS_DATA":
            return [...action.payload]
        case "CLEAR_CALL_DATA":
            return [...action.payload]
        default:
            return state
    }
}

export default callsReducer;
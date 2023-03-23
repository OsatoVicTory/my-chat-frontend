const messageReducer = (state = {}, action) => {
    switch (action.type) {
        case "GET_TAGGED_MESSAGE":
            return state
        case "SET_TAGGED_MESSAGE":
            return {...action.payload}
        default:
            return state
    }
}

export default messageReducer;
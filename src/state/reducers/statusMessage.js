const statusMessageReducer = (state = {}, action) => {
    switch (action.type) {
        case "SET_STATUS_MESSAGE":
            return {...action.payload}
        default:
            return state
    }
}

export default statusMessageReducer;
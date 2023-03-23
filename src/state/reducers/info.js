const infoReducer = (state = {}, action) => {
    switch (action.type) {
        case "GET_INFO_DATA":
            return state
        case "SET_INFO_DATA":
            return {...action.payload}
        default:
            return state
    }
}

export default infoReducer;
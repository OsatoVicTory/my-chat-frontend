const userReducer = (state = {}, action) => {
    switch (action.type) {
        case "GET_USER_DATA":
            return state
        case "SET_USER_DATA":
            return {...action.payload}
        default:
            return state
    }
}

export default userReducer;
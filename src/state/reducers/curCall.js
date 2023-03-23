const curCallReducer = (state = {}, action) => {
    switch (action.type) {
        case "SET_CUR_CALL_DATA":
            return {...action.payload}
        default:
            return state
    }
}

export default curCallReducer;
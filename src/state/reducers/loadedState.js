const loadedStateReducer = (state = {}, action) => {
    switch (action.type) {
        case "GET_LOADED_STATE":
            return state
        case "SET_LOADED_STATE":
            return {...state, ...action.payload}
        default:
            return state
    }
}

export default loadedStateReducer;
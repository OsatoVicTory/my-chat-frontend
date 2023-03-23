const mediaReducer = (state = [], action) => {
    switch (action.type) {
        case "GET_MEDIA_DATA":
            return state
        case "SET_MEDIA_DATA":
            return [...action.payload]
        default:
            return state
    }
}

export default mediaReducer;
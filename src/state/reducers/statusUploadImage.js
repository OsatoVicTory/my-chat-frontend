const statusUploadImageReducer = (state = {}, action) => {
    switch (action.type) {
        case "SET_STATUS_UPLOAD_IMAGE":
            return action.payload;
        default:
            return state
    }
}

export default statusUploadImageReducer;
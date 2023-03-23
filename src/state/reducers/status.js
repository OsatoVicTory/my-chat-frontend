const INITIAL_STATE = {};
//     mine: [],
//     recentUpdate: [],
//     viewedUpdate: []
// }

const filterById = (array, id) => {
    return array.filter((val, idx) => idx !== id);
}

const edittedData = (id, state) => {
    let newData = {};
    const { recentUpdate, viewedUpdate } = state;
    if(recentUpdate[id].viewed + 1 === recentUpdate[id].status.length-1) {
        newData.recentUpdate = filterById(recentUpdate, id);
        newData.viewedUpdate = [...viewedUpdate, recentUpdate[id]];
    } else {
        newData.recentUpdate = (recentUpdate[id].viewed||0) + 1;
        newData.viewedUpdate = viewedUpdate;
    }

    return newData;
}

const statusReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "GET_STATUS_DATA":
            return state
        case "SET_STATUS_DATA":
            return {...action.payload}
        case "SET_MY_STATUS":
            return {...state, user: action.payload}
        case "DELETE_MY_STATUS":
            return {
                ...state, 
                mine: filterById(state.mine, action.payload)
            }
        case "VIEW_STATUS":
            return edittedData(action.payload, state)
        default:
            return state
    }
}

export default statusReducer;
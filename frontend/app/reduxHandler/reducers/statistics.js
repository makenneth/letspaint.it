import ActionTypes from 'actionTypes';

const initialState = {
  connectedUsers: 0,
  ranking: [],
};

export default function Statistics(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.USER_COUNT_UPDATE:
      return {
        ...state,
        connectedUsers: action.count,
      };

    case ActionTypes.RANKING_UPDATE:
      return {
        ...state,
        ranking: action.ranking,
      };

    default:
      return state;
  }
}

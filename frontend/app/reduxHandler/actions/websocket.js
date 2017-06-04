import ActionTypes from 'actionTypes';

export function paintInputReceived(input) {
  return {
    type: ActionTypes.PAINT_INPUT_RECEIVED,
    input,
  };
}

export function initialStateUpdate(data) {
  return {
    type: ActionTypes.INITIAL_STATE_UPDATE,
    grid: data.grid,
  };
}

export function partialInitialStateUpdate(data) {
  return {
    type: ActionTypes.PARTIAL_INITIAL_STATE_UPDATE,
    grid: data.grid,
  };
}

export function userCountUpdate(data) {
  return {
    type: ActionTypes.USER_COUNT_UPDATE,
    count: data.count,
  };
}

export function rankingUpdate(data) {
  return {
    type: ActionTypes.RANKING_UPDATE,
    ranking: data.ranking,
  };
}

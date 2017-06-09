import ActionTypes from 'actionTypes';

export const startLoading = () => {
  return {
    type: ActionTypes.START_LOADING,
  };
}

export const stopLoading = () => {
  return {
    type: ActionTypes.STOP_LOADING,
  };
}

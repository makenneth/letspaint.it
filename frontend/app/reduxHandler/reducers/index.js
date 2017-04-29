import { combineReducers } from 'redux';
import grid from './grid';
import auth from './auth';

export default combineReducers({
  grid,
  auth,
});

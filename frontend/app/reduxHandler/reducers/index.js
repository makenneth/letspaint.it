import { combineReducers } from 'redux';
import grid from './grid';
import canvas from './canvas';
import auth from './auth';

export default combineReducers({
  grid,
  canvas,
  auth,
});

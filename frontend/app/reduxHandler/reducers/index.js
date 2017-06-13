import { combineReducers } from 'redux';
import grid from './grid';
import canvas from './canvas';
import statistics from './statistics';
import auth from './auth';
import loader from './loader';
import alert from './alert';
import username from './username';

export default combineReducers({
  grid,
  canvas,
  statistics,
  auth,
  loader,
  username,
  alert,
});

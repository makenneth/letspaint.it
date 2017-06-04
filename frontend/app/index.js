import 'babel-polyfill';
import 'isomorphic-fetch';
import React from 'react';
import { render } from 'react-dom';
import getRoutes from './routes';
import store from './reduxHandler/store';
import startWebsocket from 'middleware/socketHandler';

document.addEventListener('DOMContentLoaded', () => {
  // startWebsocket(store);
  render(getRoutes(store), document.getElementById('root'));
});

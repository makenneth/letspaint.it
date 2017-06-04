import 'babel-polyfill';
import 'isomorphic-fetch';
import React from 'react';
import { render } from 'react-dom';
import { Route, Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { Application, LogInSuccess } from 'components';
import getRoutes from './routes';
import store from './reduxHandler/store';
import startWebsocket from 'middleware/socketHandler';

document.addEventListener('DOMContentLoaded', () => {
  startWebsocket(store);
  render(getRoutes(store), document.getElementById('root'));
});

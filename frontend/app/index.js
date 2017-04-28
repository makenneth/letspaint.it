import 'babel-polyfill';
import 'isomorphic-fetch';
import React from 'react';
import { render } from 'react-dom';
import { Route, Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import Application from 'components/Application';
import store from './reduxHandler/store';
import startWebsocket from 'middleware/socketHandler';

document.addEventListener('DOMContentLoaded', () => {
  startWebsocket(store);
  render(<Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={Application} />
    </Router>
  </Provider>, document.getElementById('root'));
});

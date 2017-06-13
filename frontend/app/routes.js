import React from 'react';
import { Application, LogInSuccess, Auth, Main, UsernameSet } from 'components';
import { loadAuth } from 'actions';
import { Route, Router, browserHistory, IndexRoute } from 'react-router';
import { Provider } from 'react-redux';

export default function getRoutes(store) {
  const ensureLogin = function(bool, nextState, replace, callback) {
    function checkAuth() {
      const { auth } = store.getState();
      if (!!auth.info !== bool) {
        replace(bool ? '/login' : '/');
      } else if (auth.info && auth.info.username == "") {
        replace('/profile/username');
      }

      callback();
    }
    const { auth } = store.getState();
    if (auth.isLoaded) {
      checkAuth();
    } else {
      store.dispatch(loadAuth()).then(checkAuth);
    }
  };

  const ensureUsernameNotSet = function(nextState, replace, callback) {
    function checkUsername() {
      const { auth } = store.getState();
      if (auth.info && auth.info.username !== "") {
        replace('/');
      } else if (!auth.info) {
        replace('/login');
      }

      callback();
    }
    const { auth } = store.getState();
    if (auth.isLoaded) {
      checkUsername();
    } else {
      store.dispatch(loadAuth()).then(checkUsername);
    }
  };
  return (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={Application}>
          <Route onEnter={ensureLogin.bind(null, true)}>
            <IndexRoute component={Main} />
            <Route path="paint" component={Main} />
          </Route>
          <Route onEnter={ensureLogin.bind(null, false)}>
            <Route path="login" component={Auth} />
            <Route path="signup" component={Auth} />
          </Route>
          <Route onEnter={ensureUsernameNotSet}>
            <Route path="/profile/username" component={UsernameSet} />
          </Route>
        </Route>
        <Route path="/auth/success" component={LogInSuccess} />
      </Router>
    </Provider>
  );
};

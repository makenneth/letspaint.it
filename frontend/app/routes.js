import React from 'react';
import { Application, LogInSuccess, Auth, Main } from 'components';
import { Route, Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

export default function getRoutes(store) {
  const ensureLogin = function(bool, nextState, replace, callback) {
    function checkAuth() {
      const { auth } = store.getState();
      if ((auth.id && auth.username) === bool) {
        replace(bool ? '/login' : '/paint');
      }

      callback();
    }
    const { auth } = store.getState();
    if (auth.isLoaded) {
      checkAuth();
    } else {
      dispatch(loadAuth()).then(
        checkAuth,
        () => replace(bool ? '/login' : '/paint')
      );
    }
  };

  return (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route path="/" component={Application}>
          <Route onEnter={ensureLogin.bind(null, true)}>
            <Route path="/paint" component={Main} />
          </Route>
          <Route path="/login" component={Auth} />
          <Route path="/signup" component={Auth} />
        </Route>
        <Route path="/login/success" component={LogInSuccess} />
      </Router>
    </Provider>
  );
};

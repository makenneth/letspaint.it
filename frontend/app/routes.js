import React from 'react';
import { Application, LogInSuccess, Auth, Main } from 'components';
import { Route, Router, browserHistory, IndexRoute } from 'react-router';
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
            <IndexRoute component={Main} />
            <Route path="paint" component={Main} />
          </Route>
          <Route onEnter={ensureLogin.bind(null, false)}>
            <Route path="login" component={Auth} />
            <Route path="signup" component={Auth} />
          </Route>
        </Route>
        <Route path="/auth/success" component={LogInSuccess} />
      </Router>
    </Provider>
  );
};

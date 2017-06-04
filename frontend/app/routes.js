export default function getRoutes(store) {
  const ensureLoggedIn = function(nextState, replace, callback) {
    function checkAuth() {
      const { auth } = store.getState();
      if (!auth.id || !auth.username) {
        replace('/login');
      }

      callback();
    }
    const { auth } = store.getState();
    if (auth.isLoaded) {
      checkAuth();
    } else {
      dispatch(loadAuth()).then(checkAuth);
    }
  };

  return (
    <Provider store={store}>
      <Router history={browserHistory}>
        <Route onEnter={ensureLoggedIn}>
          <Route path="/" component={Application} />
        </Route>
        <Route path="/login" component={LogIn} />
        <Route path="/login/success" component={LogInSuccess} />
      </Router>
    </Provider>
  );
};

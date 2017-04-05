import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

const enhancers = [thunkMiddleware];

if (process.env.NODE_ENV !== 'production') {
  const createLogger = require('redux-logger');
  const logger = createLogger();
  enhancers.push(logger);
}

const createStoreWithMiddleware = applyMiddleware(...enhancers)(createStore);

export default function createFinalStore(initialState = {}) {
  const reducer = require('./reducers');
  const store = createStoreWithMiddleware(reducer, initialState);

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () =>
      store.replaceReducer(require('./reducers'))
    );
  }

  return store;
}

import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { socketMiddleware } from './middleware/socketHandler';
const enhancers = [thunkMiddleware, socketMiddleware];

if (process.env.NODE_ENV !== 'production') {
  const createLogger = require('redux-logger');
  const logger = createLogger();
  enhancers.push(logger);
}

const createStoreWithMiddleware = applyMiddleware(...enhancers)(createStore);

const reducer = require('./reducers');
const store = createStoreWithMiddleware(reducer);

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(require('./reducers'))
  );
}

export default store;

import ActionTypes from 'actionTypes';
import * as WebSocketActions from 'actions/websocket';
import {
  updateStatistics, alertWarningMessage, alertErrorMessage, alertSuccessMessage
} from 'actions';
import Pako from 'pako';
let socket;
let websocketClient;
let retryTimeout;
let retryCount = 0;
export const socketMiddleware = (store) => next => action => {
  if (!socket) return next(action);
  switch (action.type) {
    case ActionTypes.PAINT_INPUT_MADE:
      socket.send(JSON.stringify({
        type: 'PAINT_INPUT_MADE',
        data: action.input,
      }));
      break;
    case ActionTypes.SET_USER_INFO:
      socket.send(JSON.stringify({
        type: 'SET_USER_INFO',
        data: action.user,
      }));
      break
    default:
      break;
  }

  return next(action);
}

export function closeWebsocket() {
  if (websocketClient) {
    websocketClient.close();
    // websocketClient = null;
    socket = null;
  }
}

export default function startWebSocket(store) {
  const { dispatch, getState } = store;
  socket = new WebSocket(process.env.WS_URL);
  let retryInt;
  const messageHandler = (res) => {
    if (res.data instanceof Blob) {
      try {
        var reader = new FileReader();
        reader.addEventListener('loadend', () => {
          const unzipped = Pako.inflate((reader.result), { to: 'string' });
          const parsed = JSON.parse(unzipped);
          if (parsed && parsed.type === 'FULL_INITIAL_STATE') {
            dispatch(WebSocketActions.initialStateUpdate(parsed.data));
          }
        });
        reader.readAsArrayBuffer(res.data);
      } catch (e) {
        console.warn(e);
      }
    } else {
      const { type, data } = JSON.parse(res.data) || {};
      switch (type) {
        case 'SET_INPUT_RATE':
          dispatch(WebSocketActions.setInputRate(data));
          break;
        case 'USER_COUNT_UPDATE':
          dispatch(WebSocketActions.userCountUpdate(data));
          break;
        case 'PAINT_INPUT_MADE':
          dispatch(WebSocketActions.paintInputReceived(data));
          dispatch(updateStatistics(data.username));
          break;
        case 'INITIAL_STATE':
          dispatch(WebSocketActions.partialInitialStateUpdate(data));
          break;
        case 'RANKING_UPDATE':
          dispatch(WebSocketActions.rankingUpdate(data));
          break;
        case 'USER_INFO_SET':
          dispatch(WebSocketActions.userInfoSet(data));
          break;
        default:
          break;
      }
    }
  }

  socket.onopen = function() {
    if (retryTimeout) clearTimeout(retryTimeout);
    if (retryCount > 0) {
      dispatch(alertSuccessMessage('Successfully reconnected.'));
      retryCount = 0;
    }
  }
  socket.onconnection = function(cl) {
    websocketClient = cl;
  }

  socket.onclose = function() {
    if (retryCount === 0) {
      dispatch(alertWarningMessage('Connection closed. Attempting to reconnect...', 'infinite'));
    }
    retryTimeout = setTimeout(() => {
      retryCount += 1
      if (retryCount > 10) {
        dispatch(alertErrorMessage('Failed to reconnect. Please try again later.', 'infinite'));
      } else {
        startWebSocket(store);
      }
    }, 1000 + retryCount * 2000);
  }

  socket.onmessage = messageHandler;
  socket.onerror = (err) => {
    console.warn(err);
  }

  return socket;
}

import ActionTypes from 'actionTypes';
import { paintInputReceived } from 'actions';
let socket;

export const socketMiddleware = (store) => next => action => {
  if (!socket) return next(action);
  switch (action.type) {
    case ActionTypes.PAINT_INPUT_MADE:
      socket.send(JSON.stringify({
        type: 'PAINT_INPUT_MADE',
        data: action.input,
      }));
      break;
    default:
      break;
  }

  return next(action);
}

export default function startWebSocket({ getState, dispatch }) {
  const url = `localhost:4001/ws`;
  socket = new WebSocket(`ws://${url}`);

  const messageHandler = (res) => {
    const { type, data } = JSON.parse(res.data);
    switch (type) {
      case 'PAINT_INPUT_MADE':
        dispatch(paintInputReceived(data));
        break;
      case 'STATE_UPDATE':
        dispatch(stateUpdate(data));
        break;
      default:
        break;
    }

  }
  socket.onmessage = messageHandler;
  socket.onerror = (err) => {
    console.warn(err);
  }
}

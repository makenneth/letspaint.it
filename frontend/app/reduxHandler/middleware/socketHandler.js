import ActionTypes from 'actionTypes';
import { paintInputReceived, initialStateUpdate } from 'actions';
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
  socket = new WebSocket(process.env.WS_URL);

  const messageHandler = (res) => {
    const { type, data } = JSON.parse(res.data);
    switch (type) {
      case 'PAINT_INPUT_MADE':
        dispatch(paintInputReceived(data));
        break;
      case 'INITIAL_STATE':
        dispatch(initialStateUpdate(data));
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

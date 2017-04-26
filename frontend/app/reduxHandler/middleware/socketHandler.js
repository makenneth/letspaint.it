import ActionTypes from 'actionTypes';

let socket;

export const socketMiddleware = (store) => next => action => {
  if (!socket) return next(action);
  switch (action.type) {
    case ActionTypes.PAINT_INPUT_MADE:
      socket.send(JSON.stringify({
        type: 'PAINT_INPUT_MADE',
        data: action.payload,
      }));
      break;
    default:
      break;
  }

  return next(action);
}

export default function startWebSocket({ getState, dispatch }) {
  const url = `${process.env.WS_URL}/ws`;
  socket = new WebSocket(url);

  const messageHandler = (res) => {
    const { type, data } = JSON.parse(res.data);

    switch (type) {
      case 'PAINT_INPUT_RECEIVED':
        dispatch(newInputReceived(data));
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

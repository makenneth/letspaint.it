const getUsername = () => {
  return `user${Math.floor(Math.random() * 50)}`;
};

export default function Auth(state = { username: getUsername() }, action) {
  switch (action.type) {
    default:
      return state;
  }
}
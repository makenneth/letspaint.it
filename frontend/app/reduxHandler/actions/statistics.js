import { rankingUpdate } from './websocket';

export const updateStatistics = (username, pos) => {
  return (dispatch, getState) => {
    const { ranking } = getState().statistics;
    const { usernames } = getState().grid;
    if (usernames[pos] === username) {
      return;
    }
    const updateIndex = ranking.findIndex(u => u.username === username);
    if (updateIndex > -1) {
      const updated = ranking.map((user, i) => {
        if (i === updateIndex) {
          return Object.assign({}, user, { count: user.count + 1 });
        } else {
          return user;
        }
      });

      const newRanking = updated.sort((a, b) => b.count - a.count);
      dispatch(rankingUpdate({ ranking: newRanking }));
    }
  };
}

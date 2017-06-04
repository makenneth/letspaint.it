import { rankingUpdate } from './websocket';

export const updateStatistics = (username) => {
  return (dispatch, getState) => {
    const { ranking } = getState().statistics;
    const updateIndex = ranking.findIndex(u => u.username);

    if (updateIndex > -1) {
      const updated = ranking.map((user, i) => {
        if (i === updateIndex) {
          return Object.assign({}, user, { count: user.count + 1 });
        } else {
          return user;
        }
      }

      const newRanking = updated.sort((a, b) => b.count - a.count);
      dispatch(rankingUpdate(newRanking));
    }
  };
}

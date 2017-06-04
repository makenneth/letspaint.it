import React, { Component } from 'react';
import { connect } from 'react-redux';

import './styles.scss';

const ASSET_URL = '';

@connect(({ statistics }) => ({
  connectedUsers: statistics.connectedUsers,
  ranking: statistics.ranking,
}), {})
class Statistics extends Component {
  render() {
    return (<div className="statistics-container">
      <div className="connected-count">
        Connected: {this.props.connectedUsers}
      </div>
      <table className="ranking-list">
        <tbody>
          {
            this.props.ranking.slice(0, 10).map(({ username, count }, i) => (
              <tr key={username}>
                <td>{i + 1}</td>
                <td><img alt="profile" src={`${ASSET_URL}/${username}`} /></td>
                <td>{username}</td>
                <td>{count}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>);
  }
}

export default Statistics;

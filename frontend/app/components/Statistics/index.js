import React, { Component } from 'react';
import { connect } from 'react-redux';

const ASSET_URL = '';

@connect(({ statistics }) => ({
  connectedUsers: statistics.connectedUsers,
  ranking: statistics.ranking,
}), {})
class Statistics extends Component {
  render() {
    return (<div className="statistics-container">
      <div>
        Connected: {this.props.connectedUsers}
      </div>
      <ul className="ranking-list">
        {
          this.props.ranking.map(({ username, count }) => (
            <ol>
              <img alt="profile" src={`${ASSET_URL}/${username}`} />
              <div>
                {username}: <span>{count}</span>
              </div>
            </ol>
          ))
        }
      </ul>
    </div>);
  }
}

export default Statistics;

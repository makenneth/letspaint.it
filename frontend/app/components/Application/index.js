import React from 'react';
import { connect } from 'react-redux';
import Main from 'components/Main';
import Auth from 'components/Auth';
import 'assets/reset.css';
import './styles.scss';

@connect(({ grid }) => ({
  connectedUsers: grid.connectedUsers,
}), {})
class Application extends React.PureComponent {
  render() {
    return (
      <div className="app-container">
        <Auth />
        <h3>letspaint.it</h3>
        <div>
          <Main />
          <div>
            Connected: {this.props.connectedUsers}
          </div>
        </div>
      </div>
    );
  }
}

export default Application;

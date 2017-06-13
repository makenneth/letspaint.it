import React from 'react';
import Main from 'components/Main';
import Auth from 'components/Auth';
import Statistics from 'components/Statistics';
import Alert from './Alert';
import { logOut } from 'actions';
import { connect } from 'react-redux';
import { Spinner } from '_common';

import 'assets/reset.css';
import './styles.scss';

@connect(({ loader, auth }) => ({ loader, auth }), { logOut })
class Application extends React.PureComponent {
  render() {
    return (
      <div className="app-container">
        <h3>letspaint.it</h3>
        {this.props.children}
        <Spinner
          isLoading={this.props.auth.isLoading}
        />
        {
          this.props.auth.info &&
            (<button
              className="log-out-button"
              onClick={() => this.props.logOut()}
            >
              Log Out
            </button>)
        }
        <Alert />
      </div>
    );
  }
}

export default Application;

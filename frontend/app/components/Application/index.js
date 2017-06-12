import React from 'react';
import Main from 'components/Main';
import Auth from 'components/Auth';
import Statistics from 'components/Statistics';
import Alert from './Alert';
import { connect } from 'react-redux';
import { Spinner } from '_common';

import 'assets/reset.css';
import './styles.scss';

@connect(({ loader, auth }) => ({ loader, auth }), {})
class Application extends React.PureComponent {
  render() {
    return (
      <div className="app-container">
        <h3>letspaint.it</h3>
        {this.props.children}
        <Spinner
          isLoading={this.props.auth.isLoading}
        />
        <Alert />
      </div>
    );
  }
}

export default Application;

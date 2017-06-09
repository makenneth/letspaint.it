import React from 'react';
import Main from 'components/Main';
import Auth from 'components/Auth';
import Statistics from 'components/Statistics';
import Loader from './Loader'

import 'assets/reset.css';
import './styles.scss';

class Application extends React.PureComponent {
  render() {
    return (
      <div className="app-container">
        <h3>letspaint.it</h3>
        <div className="layout">
          <Main />
          <Statistics />
        </div>
        {this.props.children}
        <Loader />
      </div>
    );
  }
}

export default Application;

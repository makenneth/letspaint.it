import React from 'react';
import Main from 'components/Main';
import Auth from 'components/Auth';
import 'assets/reset.css';
import './styles.scss';

class Application extends React.PureComponent {
  render() {
    return (
      <div className="app-container">
        <Auth />
        <h3>letspaint.it</h3>
        <Main />
      </div>
    );
  }
}

export default Application;

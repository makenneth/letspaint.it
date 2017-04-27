import React from 'react';
import Main from 'components/Main';
import 'assets/reset.css';
import './styles.scss';

class Application extends React.PureComponent {
  render() {
    return (
      <div className="app-container">
        <Main />
      </div>
    );
  }
}

export default Application;

import React, { Component } from 'react';

import './styles.scss';

class Auth extends Component {
  state = {
    page: null,
  }

  openSignUp = () => this.setState({ page: 'signup' });
  openLogIn = () => this.setState({ page: 'login' });
  handleClose = () => this.setState({ page: null });

  render() {
    const { page } = this.state;
    const title = page === 'signup' ? 'Sign Up' : 'Log In';

    return (<div className="auth-buttons">
      <button className="sign-up" onClick={this.openSignUp}>
        Sign Up
      </button>
      <button className="log-in" onClick={this.openLogIn}>
        Log In
      </button>
      <div className={`overlay${page !== null ? ' opened': ''}`}>
        <div className="form">
          <i className="material-icons" onClick={this.handleClose}>close</i>
          <h4>{title}</h4>
          <div className="social-media-button facebook">
            <span>
              <svg viewBox="0 0 512 512"><path d="M211.9 197.4h-36.7v59.9h36.7V433.1h70.5V256.5h49.2l5.2-59.1h-54.4c0 0 0-22.1 0-33.7 0-13.9 2.8-19.5 16.3-19.5 10.9 0 38.2 0 38.2 0V82.9c0 0-40.2 0-48.8 0 -52.5 0-76.1 23.1-76.1 67.3C211.9 188.8 211.9 197.4 211.9 197.4z"/></svg>
            </span>
            {title} with Facebook
          </div>
          <div className="social-media-button google">
            <span>
              <svg viewBox="0 0 512 512"><path d="M179.7 237.6L179.7 284.2 256.7 284.2C253.6 304.2 233.4 342.9 179.7 342.9 133.4 342.9 95.6 304.4 95.6 257 95.6 209.6 133.4 171.1 179.7 171.1 206.1 171.1 223.7 182.4 233.8 192.1L270.6 156.6C247 134.4 216.4 121 179.7 121 104.7 121 44 181.8 44 257 44 332.2 104.7 393 179.7 393 258 393 310 337.8 310 260.1 310 251.2 309 244.4 307.9 237.6L179.7 237.6 179.7 237.6ZM468 236.7L429.3 236.7 429.3 198 390.7 198 390.7 236.7 352 236.7 352 275.3 390.7 275.3 390.7 314 429.3 314 429.3 275.3 468 275.3"/></svg>
            </span>
            {title} with Google
          </div>
        </div>
      </div>
    </div>);
  }
}

export default Auth;
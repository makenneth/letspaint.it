import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setUsername, isUsernameAvailable } from 'actions';

import './styles.scss';

@connect(({ username }) => ({ username }), { setUsername, isUsernameAvailable })
export default class UsernameSet extends Component {
  state = {
    username: '',
    error: null,
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.username.isAvailable && nextProps.username.isAvailable) {
      this.setState({ error: '' });
    } else if (nextProps.username.err &&
      this.props.username.err !== nextProps.username.err
    ) {
      this.setState({ error: nextProps.username.err.message });
    }
  }

  handleUsernameChange = (ev) => {
    const username = ev.target.value;

    this.setState({ username, error: null }, () => {
      if (this.checkTO) clearTimeout(this.checkTO);
      if (username.length > 5) {
        this.checkTO = setTimeout(() => {
          this.props.isUsernameAvailable(username);
        }, 500);
      }
    });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.state.username.length <= 5) {
      this.setState({ error: 'Usernames must be at least five characters long.' });
    } else if (this.state.username.length > 20) {
      this.setState({ error: 'Usernames cannot be longer than 20 characters.' });
    } else {
      this.props.setUsername(this.state.username);
    }
  }

  render() {
    let inputClassName = 'username-input';
    if (this.state.error) {
      inputClassName += ' invalid';
    } else if (this.state.error === '') {
      inputClassName += ' valid';
    }

    return (
      <div className="username-form-container">
        <form onSubmit={this.handleSubmit} className="username-form">
          <div className={inputClassName}>
            <input
              autoFocus
              id="username"
              type="text"
              value={this.state.username}
              placeholder="Pick a username (at least 5 chars long)"
              onChange={this.handleUsernameChange}
            />
            <div className="error-message">{this.state.error}</div>
            {this.state.error === '' && <i className="material-icons check">check_circle</i>}
            {this.state.error && <i className="material-icons times">not_interested</i>}
          </div>
          <input
            type="submit"
            value="Continue"
            className={this.state.error === '' ? '' : 'hide'}
          />
        </form>
      </div>
    );
  }
}

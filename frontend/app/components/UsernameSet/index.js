import React, { Component } from 'react';
import { connect } from 'react-redux';

@connect(({ username }) => ({ username }), { setUsername, isUsernameAvailable })
export default class UsernameSet extends Component {
  state = {
    username: '',
    error: null,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.username.error &&
      this.props.username.error !== nextProps.username.error
    ) {
      this.setState({ error: error.message });
    }
  }

  handleUsernameChange = (ev) => {
    const username = ev.target.value;
    this.setState({ username }, () => {
      if (username.length > 5) {
        if (this.checkTO) clearTimeout(this.checkTO);
        this.checkTO = setTimeout(() => {
          this.props.isUsernameAvailable(username);
        }, 500);
      }
    });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (username.length > 5) {
      this.props.setUsername(this.state.username);
    } else {
      this.setState({ error: 'Usernames must be at least five characters long.' });
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          onChange={this.handleUsernameChange}
        />
      </form>
    );
  }
}

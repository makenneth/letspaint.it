import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearAlertMessage } from 'actions';

import './styles.scss';

@connect(
  ({ alert: { alertMessage, alertType, timeout } }) => ({ alertMessage, alertType }),
  { clearAlertMessage }
)
export default class Alert extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.alertMessage && this.props.alertMessage !== nextProps.alertMessage) {
      if (this.to) clearTimeout(this.to);
      if (nextProps.timeout !== 'infinite') {
        this.to = setTimeout(() => this.props.clearAlertMessage(), nextProps.timeout === 'short' ? 2000 : 5000);
      }
    }
  }

  handleAlertClear = () => {
    if (this.to) clearTimeout(this.to);
    this.props.clearAlertMessage()
  }

  render() {
    const { alertMessage, alertType } = this.props;
    return (
      <div
        className={`alert-container ${alertType}${!alertMessage ? ' hide' : ''}`}
        onClick={this.handleAlertClear}
      >
        {alertMessage}
      </div>
    );
  }
}

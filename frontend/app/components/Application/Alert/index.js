import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearAlertMessage } from 'actions';

import './styles.scss';

@connect(
  ({ alert: { alertMessage, alertType } }) => ({ alertMessage, alertType }),
  { clearAlertMessage }
)
export default class Alert extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.alertMessage && nextProps.alertMessage) {
      if (this.to) clearTimeout(this.to);
      this.to = setTimeout(() => this.props.clearAlertMessage(), 3000);
    }
  }

  render() {
    const { alertMessage, alertType } = this.props;
    if (alertMessage === '') {
      return null;
    }

    return (
      <div
        className={`alert-container ${alertType}`}
        onClick={() => this.props.clearAlertMessage()}
      >
        {alertMessage}
      </div>
    );
  }
}

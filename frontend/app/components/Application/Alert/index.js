import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearAlertMessage } from 'actions';

@connect(({ alert }) => ({ alert }), { clearAlertMessage })
export default class Alert extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.alert.type && nextProps.alert.type) {
      this.props.clearAlertMessage();
    }
  }

  render() {
    const { alertMessage, alertType } = this.props;
    return (
      <div className="alert">
        {alertMessage}
      </div>
    );
  }
}

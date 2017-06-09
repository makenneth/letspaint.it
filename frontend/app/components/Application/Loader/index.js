import React, { Component } from 'react';
import { connect } from 'react-redux';
import { stopLoading } from 'actions';
import { Spinner } from '_common';

@connect(({ loader: isLoading }) => ({ isLoading }), { stopLoading })
export default class Loader extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.isLoading && nextProps.isLoading) {
      this.to = setTimeout(this.props.stopLoading, 3000);
    }
  }

  render() {
    return (
      <Spinner isLoading={this.props.isLoading} />
    );
  }
}

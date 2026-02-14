import React, { Component} from 'react';
import {ActivityIndicator} from 'react-native';

export default class Loading extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <ActivityIndicator size="large" />;
  }
}

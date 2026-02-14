import React, { Component} from 'react';
import {View, StyleSheet, StatusBar, Image, Text} from 'react-native';

const LOGO = require('../../assets/images/boot_logo.png');

export default class BootScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.main}>
        <StatusBar hidden={true} />
        <Image source={LOGO}  style={styles.logo} />
        <Text style={styles.text}>ChaChaChat</Text>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#FFBE98",
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 280,
    height: 280,
    resizeMode: 'cover'
  },
  text: {
    fontFamily: 'courgette',
    color: '#fff',
    fontSize: 55,
    fontWeight: "600",
    marginTop: 8
  }
});

import React, { Component} from 'react';
import {StyleSheet, StatusBar, SafeAreaView, View, TouchableOpacity, Text, Image, Animated} from 'react-native'
import {pushHistory, backHistory} from './navigator';
import {PRIMARY, SECONDARY, GRAY, LIGHT_GRAY, BLACK} from '../colors';

export default class BasicLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {fade: new Animated.Value(0), show_menu: false};
  }

  componentDidMount() {
    Animated.timing(this.state.fade, {
      duration: 400,
      toValue: 1,
      delay: 200,
      useNativeDriver: true
    }).start();
  }

  onBackPressed() {
    let {onBackPress} = this.props;
    if (onBackPress) {
      onBackPress();
    } else {
      backHistory();
    }
  }

  onPressRightButton() {
    let show_menu = !this.state.show_menu;
    this.setState({show_menu});
    return true;
  }


  renderBack() {
    let {backButton} = this.props;
    if (!backButton) return null;

    return (
      <TouchableOpacity style={ styles.header_back_link} onPress={e => this.onBackPressed()}>
        <Image source={BACK_ICON} style={styles.back_icon} />
      </TouchableOpacity>
    );
  }

  renderRightButton() {
    let {rightButtonIcon} = this.props;
    if (false) return null;
    return (
      <TouchableOpacity style={ styles.header_right_button} onPress={e => this.onPressRightButton()}>
        {/* <Icon name={rightButtonIcon || "cog"} style={styles.header_right_icon} /> */}
      </TouchableOpacity>
    );
  }


  renderMenu() {
    let {show_menu} = this.state;
    if (!show_menu) return null;

    let {menu} = this.props;
    return (
      <View style={styles.menu_container}>
        {menu.map(({label, fn}, index) => {
          return (
            <View key={index}>
              <TouchableOpacity style={ styles.menu_item} onPress={() => {this.onPressRightButton(); fn()}}>
                <Text style={styles.menu_item_text}>{label}</Text>
              </TouchableOpacity>
            </View>
          )
        })}
      </View>
    )
  }

  renderHeader() {
    let {title, header} = this.props;
    if (header) return header;

    return (
      <View style={styles.centered_header}>
        <Text style={ styles.centered_header_text}>{title}</Text>
      </View>
    )

  }

  render() {
    let {children} = this.props;

    return (
      <SafeAreaView style={styles.main}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <View style={styles.basic_header}>
          <View style={styles.header_left}>
            {this.renderBack()}
          </View>
          <View style={styles.header_center}>
            {this.renderHeader()}
          </View>

          <View style={styles.header_right}>
            {this.renderRightButton()}
          </View>
        </View>
        <Animated.View style={[styles.content,{opacity: this.state.fade }]}>
          {this.renderMenu()}
          {children}
        </Animated.View>
      </SafeAreaView>
    )
  }
};


const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: BLACK
  },
  content: {
    flex: 1
  },
  basic_header: {
    backgroundColor: BLACK,
    paddingHorizontal: 20,
    paddingBottom: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  header_left: {

    flex: 1
  },
  header_right: {
    flex: 1
  },
  header_center: {
     flex: 8
  },
  centered_header: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  centered_header_text: {
    fontSize: 21,
    color: GRAY,
    fontWeight: '600'
  },
  header_right_icon: {
    color: GRAY,
    fontWeight: '600'

  },
  header_right_button: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  back_icon: {
    height: 21,
    resizeMode: 'cover'
  },
  menu_container: {
    position: 'absolute',
    zIndex: 999,
    top: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 200,
    borderColor: LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 8
  },
  menu_item: {
    marginVertical: 8
  },
  menu_item_text: {
    color: BLACK
  }

});

const BACK_ICON = require('../../assets/images/left_arrow.png');

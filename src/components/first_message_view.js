import React, { Component} from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {Container, H1, Link, Text} from 'rnsuite';
import BasicLayout from './basic_layout';
import Menu from './menu';
import I18n from '../i18n'
import LocalSettings from '../local_settings';
import {PRIMARY, SECONDARY, GRAY, LIGHT_GRAY, BLACK} from '../colors';

export default class FirstMessageView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    let user_name = LocalSettings.get('user_name').then(user_name => {
      console.log({user_name});
      this.setState({user_name});
    });
  }

  selectSuggestion(suggestion) {
    let {onSubmit} = this.props;
    onSubmit(suggestion);
  }

  renderSuggestions() {
    let {assistant} = this.props;
    let {user_name} = this.state;
    let suggestions = I18n.t('first_message.suggestions');
    let replacements = {assistant_name: assistant.name, user_name: user_name};

    return suggestions.map((suggestion, index) => {
      suggestion = formatSuggestion(suggestion, replacements);
      return (
        <TouchableOpacity key={index} style={styles.suggestion} onPress={e => this.selectSuggestion(suggestion)}>
          <Text>{suggestion}</Text>
        </TouchableOpacity>
      );
    });
  }

  render() {
    let {assistant, onCancel} = this.props;
    return (
      <BasicLayout xtitle={I18n.t('first_message.title')} backButton={true} rightButtonIcon="ellipsis-v" menu={Menu}>
        <View style={styles.container}>
          <Image source={{uri: assistant.image_url}} style={styles.image}/>
          <H1>{I18n.t('first_message.header', {assistant_name: assistant.name})}</H1>
          {this.renderSuggestions()}
          <Link text={I18n.t('first_message.cancel')} onPress={onCancel} />
        </View>
      </BasicLayout>
    )
  }
}

function formatSuggestion(suggestion, replacements) {
  for (let key of Object.keys(replacements)) {
    let value = replacements[key];
    suggestion = suggestion.replaceAll('{{' + key + '}}', value);
  }
  return suggestion;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
    alignItems: 'center'
  },
  image: {
    marginTop: 34,
    width: 128,
    height: 128,
    borderRadius: 100
  },
  suggestion: {
    backgroundColor: '#fff',
    padding: 13,
    marginVertical: 8,
    borderRadius: 34
  }
});

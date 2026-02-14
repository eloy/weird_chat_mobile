import React, { Component} from 'react';
import {StyleSheet, FlatList, View, Image, Text, TouchableOpacity} from 'react-native';
import {PRIMARY, SECONDARY, GRAY, LIGHT_GRAY} from '../colors';
import BasicLayout from './basic_layout';
import {H1, H2, Button} from 'rnsuite';
import Loading from './loading';
import {pushHistory} from './navigator';
import Stadox from '../stadox';
import ApplicationConfig from '../application_config';
import Request from '../request';
import Menu from './menu';
import I18n from '../i18n'
import * as Inflected from 'inflected';

export default class Asssitants extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.renderAssistant = this.renderAssistant.bind(this);
  }

  componentDidMount() {
    this.fetchAssistants();
  }

  fetchAssistants() {
    this.setState({loading: true});
    let {backend_url} = ApplicationConfig.get();
    let url = backend_url + "/assistants";
    Request('GET', url).then(assistants => {
      // set the image url
      assistants.forEach(a => a.image_url = backend_url + a.image_path);

      this.setState({assistants, loading: false});

      let image_urls = assistants.map(a => a.image_url);
      Image.queryCache(image_urls).then(cache_result => {
        for (let image_url of image_urls) {
          if (!cache_result[image_url]) {
            Image.prefetch(image_url);
          }
        }
      });
    });
  }

  selectAssistant(assistant) {
    pushHistory('chat', {assistant});
  }

  renderAssistant(record) {
    let assistant = record.item;
    return(
      <View style={styles.assistant}>
        <H2>{assistant.name}</H2>
        <View style={styles.image_container}>
          <Image source={{uri: assistant.image_url}} style={styles.image}/>
          <TouchableOpacity style={styles.select_container} onPress={e => this.selectAssistant(assistant)}>
            <Text style={styles.select_label}>{Inflected.titleize(I18n.t('select'))}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderList() {
    let {assistants, loading} = this.state;
    if (loading) return <Loading />
    return (
      <FlatList data={assistants} keyExtractor={a => a.id} renderItem={this.renderAssistant} ListFooterComponent={ListFooter}>
      </FlatList>
    );
  }
  render() {
    return (
      <BasicLayout title="ChaChaChat" rightButtonIcon="ellipsis-v" menu={Menu} >
        <View style={styles.container}>
          <H1 style={styles.header}>{I18n.t('assistants.title')}</H1>
          {this.renderList()}
        </View>
      </BasicLayout>
    );
  }
}

class ListFooter extends Component {
  render() {
    return (
      <View style={styles.list_footer}>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    textAlign: 'center'
  },
  list: {

  },
  assistant: {
    alignItems: 'center'
  },
  image_container: {
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 34
  },
  select_container: {
    top: -50,
    height: 50,
    borderBottomRightRadius: 34,
    borderBottomLeftRadius: 34,
    backgroundColor: '#995D81DD',
    justifyContent: 'center',
    alignItems: 'center'
  },
  select_label: {
    color: LIGHT_GRAY,
    fontSize: 13,
    fontWeight: "600"
  },

  list_footer: {
    // backgroundColor: 'blue',
    height: 150
  }

});

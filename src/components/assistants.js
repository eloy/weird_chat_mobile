import React, { Component} from 'react';
import {StyleSheet, FlatList, View, Image, TouchableOpacity} from 'react-native';
import {PRIMARY, SECONDARY, GRAY, LIGHT_GRAY} from '../colors';
import BasicLayout from './basic_layout';
import {H1, H2, Button, Text} from 'rnsuite';
import SetupFilters from './setup_filters';
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
    this.ctx = Stadox.subscribe(this);
    this.state = {};
    this.renderAssistant = this.renderAssistant.bind(this);
    this.dimensions = this.ctx.get('dimensions');
  }

  static getDerivedStateFromProps(props, state) {
    if (state.all_assistants) {
      state.assistants = filterAssistants(state.all_assistants);
    }
    return state;
  }

  componentDidMount() {
    this.fetchAssistants();
  }

  fetchAssistants() {
    this.setState({loading: true});
    let {backend_url} = ApplicationConfig.get();
    let url = backend_url + "/api/assistants";
    Request('GET', url).then(all_assistants => {
      let assistants = filterAssistants(all_assistants);
      this.setState({all_assistants, assistants, loading: false});

      // set the image url
      let image_urls = assistants.map(a => a.main_image_url);
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

  renderFilters() {
    return <SetupFilters onSubmit={e => this.setState({show_filters: false})}/>
  }

  renderAssistant(record) {
    let assistant = record.item;
    let size = this.dimensions.width * 0.8;
    let image_style = {width: size, height: size};
    return(
      <View style={styles.assistant}>
        <TouchableOpacity onPress={e => this.selectAssistant(assistant)}>
          <View style={styles.image_container}>
            <Image source={{uri: assistant.main_image_url}} style={[styles.image, image_style]}/>
            <View style={styles.assistantDetails}>
              <Text style={styles.name}>{assistant.name}</Text>
              <Text style={styles.age}>{assistant.age}</Text>
            </View>

          </View>
          </TouchableOpacity>
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
    let {show_filters} = this.state;
    let assistant_filters = this.ctx.get('assistant_filters');
    if (!assistant_filters || show_filters) return this.renderFilters();

    return (
      <BasicLayout rightButtonIcon="ellipsis-v" menu={Menu} >
        <View style={styles.container}>
          <H1 style={styles.header}>{I18n.t('assistants.title')}</H1>
          <Button onPress={e => this.setState({show_filters: true})} text="Edit Preferences"></Button>
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

function filterAssistants(all_assistants) {
  let assistant_filters = Stadox.get('assistant_filters');
  if (!assistant_filters) return all_assistants;
  return all_assistants.filter(assistant => {
    if (assistant_filters.genders.indexOf(assistant.gender) === -1) return false;
    if (assistant_filters.categories.indexOf(assistant.category) === -1) return false;
    return true;
  });
}

const styles = StyleSheet.create({
  header: {
    textAlign: 'center'
  },
  list: {
  },
  assistant: {
    alignItems: 'center',
    marginTop: 21,
    marginBottom: 34,
  },
  assistantDetails: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  name: {
    fontSize: 34,
    fontWeight: 900
  },
  age: {
    fontSize: 34,
    color: GRAY,
    marginLeft: 13
  },
  image_container: {
  },
  image: {
    borderRadius: 34
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

import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import BasicLayout from './basic_layout';
import {H1, H2, Button, Text} from 'rnsuite';
import Stadox from '../stadox';
import I18n from '../i18n'
import Menu from './menu';
import Form from './form';


const GENDERS = {
  male: I18n.t('setup_filters.gender_male'),
  female: I18n.t('setup_filters.gender_female'),
}


const CATEGORIES = {
  humans: I18n.t('setup_filters.humans'),
  manga: I18n.t('setup_filters.manga')
}

export default class SetupFilters extends Component {
  constructor(props) {
    super(props);
    let assistant_filters = Stadox.get('assistant_filters') || defaultFilters();
    this.state = {assistant_filters};

    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
  }


  onChange(assistant_filters) {
    this.setState({assistant_filters});
  }

  submit() {
    let {onSubmit} = this.props;
    let {assistant_filters} = this.state;
    console.log(assistant_filters);
    Stadox.set('assistant_filters', assistant_filters);
    onSubmit && onSubmit();
  }

  renderForm() {
    let {assistant_filters} = this.state;
    const fields = [
      {name: 'genders', label: I18n.t('setup_filters.gender'), type: 'checkboxes', collection: GENDERS},
      {name: 'categories', label: I18n.t('setup_filters.category'), type: 'checkboxes', collection: CATEGORIES}
    ]
    return <Form model={assistant_filters} fields={fields} onChange={this.onChange} onSubmit={this.submit} submitLabel={I18n.t('setup_filters.submit')}/>
  }

  render() {
    return (
      <BasicLayout rightButtonIcon="ellipsis-v" menu={Menu} >
        <View style={styles.container}>
          <H1 style={styles.header}>{I18n.t('setup_filters.title')}</H1>
          {this.renderForm()}
        </View>
      </BasicLayout>
    );
  }
}


function defaultFilters() {
  return {
    genders: Object.keys(GENDERS),
    categories: Object.keys(CATEGORIES)
  }
}
const styles = StyleSheet.create({
  header: {
    textAlign: 'center'
  },

});

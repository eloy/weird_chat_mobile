import React, { Component} from 'react';
import {Platform, StyleSheet, SafeAreaView, Image, View, KeyboardAvoidingView, ScrollView, latform} from 'react-native'
import { authorize } from 'react-native-app-auth';

import BasicLayout from './basic_layout';
import {Container, H1, Link, Text, Button} from 'rnsuite';
import Form from './form';
import ApplicationConfig from '../application_config';
import LocalSettings from '../local_settings';
import Request from '../request';
import Stadox from '../stadox';
import {titleize} from 'inflected';

import I18n from '../i18n'
import {BLACK, PRIMARY, SECONDARY, LIGHT_GRAY} from '../colors';

const LOGO = require('../../assets/images/boot_logo.png');

export default class Login extends Component {
  constructor(props) {
    super(props);
    let show_code = isConfirmationCodeSent();
    let show_signup = isAccountCreated();
    this.state = {show_code, show_signup: false};
    this.showCodeForm = this.showCodeForm.bind(this);
    this.showSignupForm = this.showSignupForm.bind(this);
    this.showLoginForm = this.showLoginForm.bind(this);
  }


  showCodeForm() {
    this.setState({show_signup: false, show_code: true});
  }

  showSignupForm() {
    this.setState({show_signup: true, show_code: false});
  }

  showLoginForm() {
    this.setState({show_signup: false, show_code: false});
  }

  renderContent() {
    let {show_code, show_signup} = this.state;
    if (show_code) {
      return <CodeForm showLoginForm={this.showLoginForm} />
    }

    if (show_signup) {
      return <SignupForm showCodeForm={this.showCodeForm} showLoginForm={this.showLoginForm}  />
    }

    return <LoginForm showCodeForm={this.showCodeForm} showSignupForm={this.showSignupForm} />
  }

  render() {
    let {user} = this.state;
    return (
      <SafeAreaView style={styles.main}>
        <Container style={{flex: 1}}>
          <ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.logo_container}>
                <Image source={LOGO}  style={styles.logo} />
              </View>

              {this.renderContent()}
            </KeyboardAvoidingView>
      </ScrollView>
        </Container>
      </SafeAreaView>
    )
  }
}


class LoginForm extends Component {
   constructor(props) {
     super(props);
     let user = {email: '', password: ''};
     this.state = {user};

     this.onChange = this.onChange.bind(this);
     this.onSubmit = this.onSubmit.bind(this);
   }

  componentDidMount() {
    LocalSettings.get('user_email').then(email => {
      this.setState({user: {email}});
    });
  }

  onChange(user) {
    this.setState({user});
  }

  onSubmit() {
    let {user} = this.state;
    let {backend_url} = ApplicationConfig.get();
    let url = backend_url + "/api/sessions"
    this.setState({submitting: true});

    Request('POST', url, {user}).then((response) => {
      LocalSettings.set('api_token', response.token);
      Stadox.set('api_token', response.token);
    }).catch(errors => {
      console.log("ERROR", errors);
      this.setState({errors, submitting: false});
    });
  }


  fields() {
    return [
      {name: 'email', label: titleize(I18n.t('email')), type: 'email', required: true},
      {name: 'password', label: titleize(I18n.t('password')), type: 'password', required: true, extra: {onSubmitEditing: this.onSubmit}},
    ];
  }

  render() {
    let {user, errors, submitting} = this.state;

    return (
      <View>
        <H1>{I18n.t('login.signin.header')}</H1>

        <Text>{I18n.t('login.signin.subheader')}</Text>
        <View style={styles.form}>
          <Form submitLabel={I18n.t('submit')} model={user} fields={this.fields()} onChange={this.onChange} onSubmit={this.onSubmit} onCancel={this.onCancel} errors={errors} submitting={submitting} />
        </View>
        <View style={styles.actionLink}>
          <Link text={I18n.t('login.no_account_yet')} onPress={this.props.showSignupForm}/>
          <GoogleOauth />
        </View>
      </View>
    )
  }
}


class SignupForm extends Component {
  constructor(props) {
    super(props);
    let user = {name: '', email: ''};
    this.state = {user};

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }


  onChange(user) {
    this.setState({user});
  }

  onSubmit() {
    let {user} = this.state;
    let {backend_url} = ApplicationConfig.get();
    let url = backend_url + "/api/users"
    this.setState({submitting: true});

    Request('POST', url, {user}).then(user => {

      // Save the user details
      let confirmation_code_request_at = Date.now()
      let promises = [
        LocalSettings.set('user_id', user.id),
        LocalSettings.set('user_name', user.name),
        LocalSettings.set('user_email', user.email),
        // LocalSettings.set('user_phone', user.phone),
        LocalSettings.set('confirmation_code_request_at', confirmation_code_request_at),
      ]

      Promise.all(promises).then(() => {
        Stadox.set('user_id', user.id);
        this.props.showCodeForm();
      });

    }).catch(errors => {
      console.log("ERROR", errors);
      this.setState({errors, submitting: false});
    });
  }


  fields() {
    return [
      {name: 'name', label: titleize(I18n.t('name')), required: true},
      {name: 'email', label: titleize(I18n.t('email')), type: 'email', required: true},
      {name: 'password', label: titleize(I18n.t('password')), type: 'password', required: true},
      {name: 'password_confirmation', label: titleize(I18n.t('password_confirmation')), type: 'password', required: true, extra: {onSubmitEditing: this.onSubmit}},
    ];
  }


  render() {
    let {user, errors, submitting} = this.state;
    return (
      <View>
        <H1>{I18n.t('login.signup.header')}</H1>
        <Text>{I18n.t('login.signup.subheader')}</Text>
        <View style={styles.form}>
          <Form submitLabel={I18n.t('submit')} model={user} fields={this.fields()} onChange={this.onChange} onSubmit={this.onSubmit} onCancel={this.onCancel} errors={errors} submitting={submitting}/>
        </View>
        <View style={styles.actionLink}>
          <Link text={I18n.t('login.account_created_already')} onPress={this.props.showLoginForm}/>
          <Link text={I18n.t('login.code_received')} onPress={this.props.showCodeForm}/>
          <GoogleOauth />
        </View>
      </View>
    )
  }
}


class CodeForm extends Component {
  constructor(props) {
    super(props);
    let user = {code: ''};
    this.state = {user};

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    LocalSettings.get('user_email').then(email => {
      let {user} = this.state;
      user.email = email;
      this.setState({user});
    });
  }

  onChange(user) {
    this.setState({user});
  }

  onSubmit() {
    let {user} = this.state;
    let {backend_url} = ApplicationConfig.get();
    let url = backend_url + "/users/get_token"
    this.setState({submitting: true});

    Request('POST', url, {user}).then(response => {
      console.log(response)
      let promises = [
        LocalSettings.set('confirmation_code_request_at', null),
        LocalSettings.set('api_token', response.token),
        LocalSettings.set('user_name', response.user.name),
        LocalSettings.set('user_age', response.user.age),
        LocalSettings.set('user_gender', response.user.gender)
      ]
      Promise.all(promises).then(() => {
        Stadox.set('api_token', response.token);
      });

    }).catch(errors => {
      console.log("ERROR", errors);
      this.setState({errors, submitting: false});
    });
  }


  fields() {
    return [
      {name: 'code', label: 'Codigo', required: true, extra: {keyboardType: 'numeric', onSubmitEditing: this.onSubmit}},
    ];
  }

  render() {
    let {user, errors, submitting} = this.state;
    return (
      <View style={styles.container}>
        <H1>{I18n.t('login.code.header')}</H1>
        <Text>{I18n.t('login.code.subheader')}</Text>
        <View style={styles.form}>
          <Form submitLabel={I18n.t('submit')} model={user} fields={this.fields()} onChange={this.onChange} onSubmit={this.onSubmit} onCancel={this.onCancel} errors={errors} submitting={submitting} />
        </View>
        <View style={styles.actionLink}>
          <Link text={I18n.t('login.no_code_yet')} onPress={this.props.showLoginForm}/>
        </View>
      </View>
    )
  }
}


class GoogleOauth extends Component {
  constructor(props) {
    super(props);
  }


  sign_in(e) {
    console.log("sign in");
    let {google_client_id_ios, google_client_id_android} = ApplicationConfig.get();
    let google_client_id = Platform.OS === 'ios' ? google_client_id_ios : google_client_id_android;

    let config = {
      issuer: 'https://accounts.google.com',
      clientId: `${google_client_id}.apps.googleusercontent.com`,
      redirectUrl: `com.googleusercontent.apps.${google_client_id}:/oauth2redirect/google`,
      scopes: ['openid', 'profile'],
    };

    // Log in to get an authentication token
    authorize(config).then(authState => {
      console.log(authState);
    });
  }


  render() {
    return (
      <View>
        <Text>FOO</Text>
        <Button onPress={e => this.sign_in(e)} text="Login with Google" />
      </View>
    )
  }
}

const GENDERS = {
  male: 'Hombre',
  female: 'Mujer',
  other: 'Otro'
}
const CONFIRMATION_CODE_VALIDITY = 3 * 60 * 60 * 1000; // 3 hours

function isConfirmationCodeSent() {
  let {confirmation_code_request_at} = Stadox.state();
  if (!confirmation_code_request_at) return false;
  return (Date.now() - confirmation_code_request_at) < CONFIRMATION_CODE_VALIDITY
}
function isAccountCreated() {
  let {user_id} = Stadox.state();
  return !!user_id;
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: BLACK
  },

  container: {

  },
  logo_container: {
    marginTop: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'cover'
  },

  form: {
    marginVertical: 34
  },
  actionLink: {
  }
});

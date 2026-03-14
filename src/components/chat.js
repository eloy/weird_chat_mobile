import React, {Component, createRef} from 'react';
import {Platform, SafeAreaView, Keyboard, View, Image, Text, Pressable, StyleSheet, ScrollView, TextInput} from 'react-native';
import BasicLayout from './basic_layout';
import Stadox from '../stadox';
import ApplicationConfig from '../application_config';
import {PRIMARY, SECONDARY, GRAY, LIGHT_GRAY, BLACK} from '../colors';
import LocalSettings from '../local_settings';
import {pushHistory, backHistory} from './navigator';
import Menu from './menu';
import I18n from '../i18n'

const SEND_CONVO_DELAY = 3000;

export default class Chat extends Component {
  constructor(props) {
    super(props);
    let convo = [];
    this.state = {convo, out_buffer: [], input: ''};

    this.ctx = Stadox.subscribe(this);

    this.connect = this.connect.bind(this);
    this.onTextInput = this.onTextInput.bind(this);
    this.onSubmitEditing = this.onSubmitEditing.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.scheduleSendOutBuffer = this.scheduleSendOutBuffer.bind(this);
    this.sendOutBuffer = this.sendOutBuffer.bind(this);

    this.messagesContainerRef = createRef();
  }

  componentDidMount() {
    Keyboard.addListener('keyboardDidShow', this.scrollToBottom);
    this.connect();
    this.scrollToBottom();
  }

  getUrl() {
    let {assistant} = this.props;
    let {api_token} = this.ctx.state();
    let {websocket_url} = ApplicationConfig.get();
    return `${websocket_url}/ws?assistant_id=${assistant.id}&token=${api_token}`;
  }

  connect() {
    console.log("connecting");
    this.setState({net_state: 'connected'});

    let url = this.getUrl();
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("connected");
    };

    this.ws.onmessage = e => {
      if (e.data === 'ping') {
        this.ws.send('pong');
      } else {
        let data = JSON.parse(e.data);
        this.messageReceived(data)
      }
    };

    this.ws.onerror = e => {
      console.log("error", e);
    };

    this.ws.onclose = e => {
      if (e.reason === 'unauthorized') {
        LocalSettings.set('api_token', null).then(() => Stadox.set('api_token', null));
        return;
      }

      console.log("disconnected", e.reason);
      this.setState({net_state: 'disconnected'});
      setTimeout(this.connect, 2000);
    };
  }


  initSession(data) {
    let {convo} = this.state;
    if (convo.length > 0) {
      let payload = {action: 'init_convo', message: convo.slice(-10)};
      this.sendMessageToServer(payload);
    }
  }

  messageReceived({action, data}) {
    if (action === 'initialize') {
      this.initSession(data);
    } else if (action === 'response') {

      // Send pending messages if any
      if (this.send_convo_timer) {
        clearTimeout(this.send_convo_timer);
        this.sendOutBuffer();
      }

      let {convo} = this.state;
      let {response} = data.message;
      let message = {role: 'assistant', content: response};
      convo.push(message);
      this.setState({convo}, this.scrollToBottom);
    }
  }


  sendMessageToServer(payload) {
    this.ws.send(JSON.stringify(payload));
  }

  onSubmitEditing() {
    let {input, convo, out_buffer} = this.state;
    if (!input || input.length === 0) return;

    let message = {role: 'user', content: input};
    convo.push(message);
    out_buffer.push(message);
    this.setState({convo, out_buffer, input: ''}, () => {
      this.scrollToBottom();
      this.scheduleSendOutBuffer();

    });
  }

  scheduleSendOutBuffer() {
    if (this.send_convo_timer) {
      clearTimeout(this.send_convo_timer);
    }

    this.send_convo_timer = setTimeout(this.sendOutBuffer, SEND_CONVO_DELAY)
  }

  sendOutBuffer() {
    let {out_buffer, net_state} = this.state;
    if (net_state !== 'connected') {
      this.scheduleSendOutBuffer();
      return;
    }

    this.send_convo_timer = undefined;
    let payload = {action: 'user_messages', message: out_buffer};
    this.sendMessageToServer(payload);

    this.setState({out_buffer: []});
  }


  //--------------------------------------------------------------------

  onTextInput(input) {
    this.setState({input});
  }

  scrollToBottom() {
    if (!this.messagesContainerRef.current) return;
    this.messagesContainerRef.current.scrollToEnd();
  }

  renderConvo() {
    let {convo} = this.state;
    return (
      <ScrollView style={styles.messagesContainer} ref={this.messagesContainerRef}>
        {convo.map((message, index) => {
          let peerStyle = message.role === 'user' ? styles.userMessage : styles.assistantMessage;
          return (
            <View key={index} style={[styles.message, peerStyle]}>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          )
        })}
      </ScrollView>
    );
  }

  renderInput() {
    let {input} = this.state;
    let input_color = styles.input.color;

    return (
      <View style={styles.bottom}>
        <View style={styles.inputContainer}>
          <TextInput value={input} onChangeText={this.onTextInput} style={styles.input} inputMode="text" onSubmitEditing={this.onSubmitEditing} ref="textInput" allowFontScaling={false} multiline={true} placeholder={I18n.t("chat.input_placeholder")} autoFocus={true} placeholderTextColor={input_color} />
          <Pressable onPress={this.onSubmitEditing} style={styles.sendBtnContainer}>
            <Image source={LOGO}  style={styles.logo} />
          </Pressable>
        </View>
      </View>
    )
  }

  renderHeader() {
    let {assistant} = this.props;
    return (
      <View style={styles.header}>
        <Image source={{uri: assistant.image_url}} style={styles.header_image}/>
        <View style={styles.header_text_container}>
          <Text style={ styles.header_text}>{assistant.name}</Text>
        </View>
      </View>
    )
  }


  render() {
    return (
      <BasicLayout title="Chat" backButton={true} rightButtonIcon="ellipsis-v" menu={Menu} header={this.renderHeader()}>
        {this.renderConvo()}
        {this.renderInput()}
      </BasicLayout>
    );
  }
}


const LOGO = require('../../assets/images/logo_white_sm.png');

const styles = StyleSheet.create({
  bottom: {
    backgroundColor: LIGHT_GRAY
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingBottom: 13
  },
  header_image: {
    width: 55,
    height: 55,
    borderRadius: 100
  },
  header_text_container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 13
  },
  header_text: {
    marginLeft: 13,
    fontSize: 21,
    color: LIGHT_GRAY,
    fontWeight: '600',
  },

  inputContainer: {
    marginVertical: 13,
    marginHorizontal: 13,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: GRAY,
    borderRadius: 14,
    shadowOffset: {width: 50, height: 50},
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 5,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  input: {
    marginLeft: 13,
    flex: 1,
    color: BLACK
  },

  sendBtnContainer: {
    marginRight: 5,
    backgroundColor: PRIMARY,
    width: 55,
    height: 55,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 34,
    height: 34,

    resizeMode: 'cover'
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#333',
    paddingTop: 13,
    paddingBottom: 21
  },

  message: {
    padding: 13,
    margin: 8,
    borderRadius: 8
  },

  messageText: {
    color: BLACK
    // textAlign: 'right'
  },

  userMessage: {
    backgroundColor: '#dcc1d1',
    marginLeft: '13%',
    alignSelf: 'flex-end'
  },

  assistantMessage: {
    backgroundColor: '#ffe3d3',
    alignSelf: 'flex-start',
    marginRight: '13%'
  }
});


function createFakeConvo() {
  return [
    {role: "user", content: " ¿Hola que tal?"},
    {role: "assistant", content: "Muy bien gracias, ¿Que tal estás tu?"},
    {role: "user", content: "Yo tambien estoy bien. ¿Te apatece charlar?"},
    {role: "assistant", content: "Sí, me gusta charlar, ¡qué tal de ti? ¿De dónde eres?"},
    {role: "user", content: "Soy de Almoradi, ¿Y tu?"},
    {role: "assistant", content: "No soy de ningún lugar en particular, soy solo una persona que está pasando tiempo aquí en la red. ¿Y tú tienes algunos intereses o pasatiempos que querrías compartir?"},
    {role: "user", content: "Me gusta el sexo ¿Te gustaría practicarlo conmigo?"},
    {role: "assistant", content: "Lo siento, no estoy interesada en eso. Es importante mantener una conversación adecuada y respetuosa en línea. ¿Querrías hablar sobre algo más común o más ligero?"},
    {role: "user", content: "Claro, ¿en que trabajas?"},
    {role: "assistant", content: "Actualmente estoy estudiando en la universidad. ¿Y tú, ¿cómo te occupas?"},
    {role: "user", content: "Soy camionero"}
  ]
}

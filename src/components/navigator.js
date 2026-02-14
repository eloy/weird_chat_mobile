import React, { Component} from 'react';
import {BackHandler} from 'react-native';
import Stadox from '../stadox';
import BootScreen from './boot_screen';

import Login from './login';
import Assistants from './assistants';
import Chat from './chat';

const HOME = Assistants;

export class Router extends Component {
  constructor(props) {
    super(props);
    this.ctx = Stadox.subscribe(this);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', backHistory);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', backHistory);
    this.ctx.unsubscribe(this);
  }

  getCurrent() {
    let {initialized, current_route, api_token} = this.ctx.state();

    if (!initialized) {
      console.log("boot");
      return [BootScreen];
    }

    if (!api_token) {
      console.log("login");
      return [Login];
    }

    if (current_route) {
      let {id, opt} = current_route;
      let element = ROUTE_MAPPING[id];
      if (!element) throw("ERROR: Element not found: " + id);
      return [element, opt];
    } else {
      console.log("home");
      return [HOME, []];
    }
    return false;
  }

  render() {
    let [element, options] = this.getCurrent();
    return React.createElement(element, options);
  }
}


const HISTORY = [];

export function pushHistory(id, opt={}) {
  let current_route = {id, opt};
  if (id === 'today') {
    HISTORY.splice(0, HISTORY.length)
  } else {
    HISTORY.push(current_route);
  }

  Stadox.set('current_route', current_route);
  return true;
}

export function backHistory() {
  if (HISTORY.length === 0) return false;

  HISTORY.pop();
  let current_route = HISTORY[HISTORY.length - 1];
  Stadox.set('current_route', current_route);
  return true;
}

export function updateRouteProps(changes) {
  let current_route = HISTORY[HISTORY.length - 1]
  current_route.opt = Object.assign({}, current_route.opt, changes);
  Stadox.set('current_route', current_route);
  return true;
}

const ROUTE_MAPPING = {
  chat: Chat
}

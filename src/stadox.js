import Immutable from 'immutable';

export default {
  init: function(initial_state={}, name='root') {
    scopes[name] = new Stadox(initial_state);
  },

  subscribe: function(component, name='root') {
    let stadox = scopes[name];
    stadox.subscribe(component);
    return stadox;
  },

  set: function(key, value, name='root') {
    let stadox = scopes[name];
    stadox.set(key, value);
  },

  get: function(key, name='root') {
    let stadox = scopes[name];
    stadox.get(key);
  },

  state: function(name='root') {
    let stadox = scopes[name];
    return stadox.state();
  }

}


class Stadox {
  constructor(initial_state={}) {
    this.current_state = Immutable.fromJS(initial_state);
    this.components = [];
  }

  state() {
    return this.current_state.toJS();
  }

  subscribe(component) {
    this.components.push(component);
  }

  unsubscribe(component) {
    let index = this.components.findIndex(c => c === component);
    this.components.splice(index, 1);
  }

  get(key) {
    return this.current_state.get(key);
  }

  set(key, value) {
    if (this.get(key) === value) return;

    this.current_state = this.current_state.set(key, value);
    this._dispatch();
  }

  _dispatch() {
    for (let c of this.components) {
      c.forceUpdate();
    }
  }
}


const scopes = {}
